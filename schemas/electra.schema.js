const { gql } = require('apollo-server');

const typeDefs = gql`
  # scalar _Any
  # scalar _FieldSet

  # # a union of all types that use the @key directive
  # union _Entity

  # type _Service {
  #   sdl: String
  # }

  # extend type Query {
  #   _entities(representations: [_Any!]!): [_Entity]!
  #   _service: _Service!
  # }

  # directive @external on FIELD_DEFINITION
  # directive @requires(fields: _FieldSet!) on FIELD_DEFINITION
  # directive @provides(fields: _FieldSet!) on FIELD_DEFINITION
  # directive @key(fields: _FieldSet!) on OBJECT | INTERFACE

  # # this is an optional directive discussed below
  # directive @extends on OBJECT | INTERFACE

  type Query {
    hello: Hello
  }

  type Hello {
    content: String
  }
`

const resolvers = {
  Query: {
    hello: () => ({ content: 'XD', user: { name: 'gabtrompiz' } }),
  },
};

module.exports = { resolvers, typeDefs }