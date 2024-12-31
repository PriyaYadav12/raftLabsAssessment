import { gql } from 'graphql-tag';

export const typeDefs = gql`
    type User {
        id: ID!
        email: String!
        token: String
    }
    type Post {
        id: ID!
        title: String!
        content: String!
    }

    type Query {
        login(email: String!, password: String!): User
        getPosts: [Post]
    }

    type Mutation {
        signUp(email: String!, password: String!): User
        createPost(title: String!, content: String!): Post
    }
`;
