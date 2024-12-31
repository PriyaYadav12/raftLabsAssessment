import { User, Post } from '../models';
import { hashPassword, comparePassword, generateToken } from './utils';
import Joi from 'joi';
import { ApolloError } from 'apollo-server-express';
import redisClient from './redisConnect';

// Validation schemas
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    }),
});

const signUpSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
    }),
});

export const resolvers = {
    Query: {
        getPosts: async (_: any, __: any, { user }: any) => {
            if (!user) throw new Error('Authentication required');
            const userId = user.userId; // user object contains the userId from JWT

            // Check Redis for cached posts in the queue
            const cachedPosts = await redisClient.lRange(`posts:${userId}`, 0, -1);

            if (cachedPosts.length > 0) {
                return cachedPosts.map(post => JSON.parse(post)); // Parse and return the posts
            }

            // If no posts in cache, fetch from DB
            const posts = await Post.findAll({
                where: { userId },
                include: [{ model: User, as: 'user' }],
            });

            // Cache the fetched posts in Redis queue for future requests
            if (posts.length > 0) {
                for (const post of posts) {
                    await redisClient.rPush(`posts:${userId}`, JSON.stringify(post));
                }
                await redisClient.expire(`posts:${userId}`, 600); // Set expiration time (1 hour)
            }

            return posts;
        },

        login: async (_: any, { email, password }: { email: string; password: string }) => {
            try {
                const { error } = loginSchema.validate({ email, password });
                if (error) {
                    throw new Error(error.details[0].message);
                }

                const user = await User.findOne({ where: { email } });
                if (!user) {
                    throw new ApolloError('User not found', 'USER_NOT_FOUND', { field: 'email' });
                }

                const isPasswordValid = await comparePassword(password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }

                const token = generateToken(user.id.toString());
                // Fetch posts for the user from the database
                const posts = await Post.findAll({ where: { userId: user.id } });

                // Cache the posts in Redis queue
                if (posts.length > 0) {
                    for (const post of posts) {
                        await redisClient.rPush(`posts:${user.id}`, JSON.stringify(post));
                    }
                    await redisClient.expire(`posts:${user.id}`, 600); // Set expiration time (1 hour)
                }

                return { id: user.id, email: user.email, token };
            } catch (error: any) {
                throw new ApolloError(error.message || 'Unknown error occurred', 'LOGIN_ERROR');
            }
        },
    },

    Mutation: {
        signUp: async (_: any, { email, password }: { email: string; password: string }) => {
            try {
                const { error } = signUpSchema.validate({ email, password });
                if (error) {
                    throw new Error(error.details[0].message);
                }

                const userExists = await User.findOne({ where: { email } });
                if (userExists) {
                    throw new Error('User already exists');
                }

                const hashedPassword = await hashPassword(password);
                const newUser = { email, password: hashedPassword };
                const insertedUser = await User.create(newUser);
                const token = generateToken(insertedUser.id.toString());

                return { id: insertedUser.id, email: newUser.email, token };
            } catch (error: any) {
                throw new ApolloError(error.message || 'Sign up failed', 'SIGNUP_ERROR');
            }
        },

        createPost: async (_: any, { title, content }: any, { user,io }: any) => {
            if (!user) throw new Error('Authentication required');

            // Create new post in the database
            const newPost = await Post.create({ title, content, userId: user.userId });

            // Push the new post to Redis queue (if cache exists)
            const cachedPosts = await redisClient.lRange(`posts:${user.userId}`, 0, -1);

            if (cachedPosts.length > 0) {
                // If posts are cached, append the new post to the cache queue
                await redisClient.rPush(`posts:${user.userId}`, JSON.stringify(newPost));
            } else {
                // If no cache exists, initialize the cache with the new post
                await redisClient.rPush(`posts:${user.userId}`, JSON.stringify([newPost]));
            }
            const room = 'posts-room'; 
            io.to(room).emit('postCreated', newPost);            // Set expiration time for cache
            await redisClient.expire(`posts:${user.userId}`, 600);
            
            return newPost;
        },
    },
};
