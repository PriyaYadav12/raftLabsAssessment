import express, { Express } from 'express';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from 'body-parser';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import dotenv from 'dotenv';
import { verifyToken } from './utils';
import { AuthenticationError } from 'apollo-server-express';
import http from 'http';
import { setupSocket } from "./socket";

dotenv.config();

// Create an Express application
const app: Express = express();
// Create an Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});
//Create WebSocket Server instance
const httpServer = http.createServer(app);
const io = setupSocket(httpServer);
// Start the server
async function startServer(): Promise<void> {
  app.use(bodyParser.json());
  app.use(cors());

  await server.start();

  // Move the context logic here
  app.use("/graphql", expressMiddleware(server, {
    context: async ({ req}) => {
      const token = req.headers.authorization || '';
      let user = null;
      if (req.body && req.body.operationName === 'IntrospectionQuery') {
        return {};
      }
      if (token) {
        try {
          user = verifyToken(token?.split(" ")[1]);
        } catch (error: any) {
          throw new AuthenticationError(error.message);
        }
      }
      return { user, io };
    }
  }));
  httpServer.listen({ port: process.env.PORT || 3000 }, () => {
    console.log(`Server ready at http://localhost:${process.env.PORT || 4000}`);
  });

  

  // Start listening on the specified port
}

// Call the startServer function
startServer().catch((error: Error) => {
  console.error('Error starting the server:', error);
});
