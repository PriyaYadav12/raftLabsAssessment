import { Sequelize } from 'sequelize';
import User from './user';
import Post from './post';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME || 'database',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password', {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port:5433
});

// Initialize models after creating sequelize instance
User.init(User.getAttributes(), { sequelize });
Post.init(Post.getAttributes(), { sequelize });
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Post };
