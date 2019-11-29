const throng = require('throng');
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const port = process.env.PORT || 5000;

const express = require('express');
const federatedApp = express();
const gatewayApp = express();
const { gql } = require('apollo-server-express');
const { buildFederatedSchema } = require('@apollo/federation');
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set('Authorization', 'Bearer c7c23e9a1f7f73ca6b1a85f77f316d5d38ead49c');
  }
}

const start = () => {
  let { ApolloServer } = require('apollo-server-express')

  const typeDefs = gql`
    type Query {
      hello: Hello
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

  federatedApp.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Ok'
    })
  })

  const federatedServer = new ApolloServer({ 
    schema: buildFederatedSchema([{ typeDefs, resolvers }]),
    introspection: true,
    playground: true,
    debug: true,
    tracing: true
  });

  federatedServer.applyMiddleware({ app: federatedApp }, '/');

  federatedApp.listen(4001, () => { console.log(`Electra federated graph on port 4001`) })

  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'Electra', url: 'http://localhost:4001/graphql' },
      { name: 'GitHub', url: 'https://api.github.com/graphql' }
    ],
    buildService: ({ name, url}) => new AuthenticatedDataSource({ url })
  })

  ApolloServer = require('apollo-server').ApolloServer;

  const gatewayServer = new ApolloServer({
    gateway,
    subscriptions: false,
    introspection: true,
    playground: true,
    debug: true,
    tracing: true,
  })

  gatewayServer.listen(5000, () => { console.log(`Unique graph at port ${port}`) })
}

throng({
  workers: WORKERS,
  lifetime: Infinity
}, start);