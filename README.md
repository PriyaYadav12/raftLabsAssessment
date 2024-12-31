This project is a Node.js application built with TypeScript and GraphQL. It provides a basic setup for running a GraphQL server with TypeScript support.

Prerequisites
Ensure you have the following installed:

Node.js (version >= 14.x)
npm (version >= 6.x)
TypeScript (installed globally or as a project dependency)
GraphQL (GraphQL server setup)
Setup
1. Clone the repository
First, clone the repository to your local machine:

bash
Copy code
git clone https://github.com/PriyaYadav12/raftLabsAssessment.git
cd to your project
2. Install Dependencies
Run the following command to install all the required dependencies:

npm install
This will install both runtime dependencies and TypeScript-related packages.

3. Set up Environment Variables
If your project uses environment variables (e.g., for database connections, authentication, etc.), create a .env file in the root directory of the project and add your configuration. Here's an example:

cp .env.example .env

Make changes to the postgres username and password 

4. Run the Application
You can run the project in development mode using the following command:
npm start

This will compile the TypeScript files and start the GraphQL server, typically running at http://localhost:3000.

6. GraphQL Queries
You can interact with the GraphQL API using a tool like Postman.
Collection file has been provided



bash
Copy code
├── src/                # TypeScript source code
│   ├── resolvers.ts    # GraphQL resolvers
│   ├── schema.ts       # GraphQL schemas
│   ├── models/         # Database models
│   ├── index.ts        # Entry point for the GraphQL server
│   ├── utils.ts        # Utility functions
│   └── config/         # Configuration file (e.g., for environment variables)
├── .env                # Environment configuration
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project README (this file)
9. Scripts
npm start: Starts the server in development mode (with TypeScript transpilation on-the-fly).
npm run build: Builds the TypeScript code to JavaScript in the dist/ folder.

10.Database Setup
Ensure that the target PostgreSQL database is set up and running, whether it's on another server, Docker container, or a local installation.
copy the dump file to docker container
docker cp ./db_backup.dump <target_container_name>:/tmp/db_backup.dump
docker exec -it <target_container_name> bash
pg_restore -U <your_postgres_user> -d <your_database_name> -F c /tmp/db_backup.dump

Troubleshooting
If you're having issues with TypeScript compilation, make sure tsconfig.json is properly configured and all dependencies are installed.
Ensure that any required environment variables are set correctly in the .env file.