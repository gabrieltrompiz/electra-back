const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = require('express')();

const { Subject } = require('rxjs');
const { ApolloServer } = require('apollo-server-express');
const { mergeSchemas, makeExecutableSchema } = require('graphql-tools');

let schemas = [];
let gitHubSchema = null;
let server = null;
const subject = new Subject();

const GitHubSchemaController = require('./controllers/GitHubSchemaController');
const controller = new GitHubSchemaController('https://api.github.com/graphql', subject);

const start = async () => {
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Ok!'
    })
  });

  const initSchemas = async () => {
    gitHubSchema = await controller.createGHchema('https://api.github.com/graphql', subject);
    schemas = [];

    const { typeDefs, resolvers } = require('./schemas/electra.schema');
    const { linkTypeDefs } = require('./schemas/extensions.schema');

    const electraSchema = makeExecutableSchema({
      typeDefs,
      resolvers
    });

    schemas.push(electraSchema);
    schemas.push(gitHubSchema);
    schemas.push(linkTypeDefs);
    
    const mainSchema = mergeSchemas({
      schemas
    });

    server = new ApolloServer({ 
      schema: mainSchema,
      introspection: true,
      playground: true,
      debug: true,
      tracing: true,
      context: ({ req }) => ({
        headers: req.headers
      })
    });

    server.applyMiddleware({ app, path: '/' });
  }

  subject.subscribe({
    next: initSchemas
  });
  subject.next();

  app.listen({ port }, () => { console.log(`Listening on port ${port}`) });
}

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);