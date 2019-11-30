const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = require('express')();

const { ApolloServer } = require('apollo-server-express');
const { mergeSchemas, makeExecutableSchema } = require('graphql-tools');

const { getGitHubSchema } = require('./getGitHubSchema');

const start = async () => {
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Ok!'
    })
  })

  const { typeDefs, resolvers } = require('./schemas/electra.schema');
  const { linkTypeDefs } = require('./schemas/extensions.schema');

  const electraSchema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const gitHubSchema = await getGitHubSchema(
    process.env.GITHUB_TOKEN || '',
    'https://api.github.com/graphql'
  );

  const mainSchema = mergeSchemas({
    schemas: [gitHubSchema, electraSchema, linkTypeDefs]
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