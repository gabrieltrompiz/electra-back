const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const port = process.env.PORT || 5000;

const app = require('express')();

const { ApolloServer, gql } = require('apollo-server-express');
const { mergeSchemas, makeExecutableSchema } = require('graphql-tools');

const { getGitHubSchema } = require('./getGitHubSchema');

const start = async () => {
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Ok!'
    })
  })

  const typeDefs = gql`
    type Query {
      hello: String
    }

    type Hello {
      content: String
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
  };

  const electraSchema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const gitHubSchema = await getGitHubSchema(
    '72ecfb2527edf74bff29d3718a558f97a2f303bc',
    'https://api.github.com/graphql'
  );

  const mainSchema = mergeSchemas({
    schemas: [gitHubSchema, electraSchema]
  })

  const server = new ApolloServer({ 
    schema: mainSchema,
    introspection: true,
    playground: true,
    debug: true,
    tracing: true
  });

  server.applyMiddleware({ app, path: '/' })

  app.listen({ port }, () => { console.log(`Listening on port ${port}`) })
}

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);