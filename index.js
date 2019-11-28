const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const port = process.env.PORT || 5000;

const app = require('express')();
const { ApolloServer, gql } = require('apollo-server-express');

const start = () => {
  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
  };

  app.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Ok'
    })
  })

  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
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