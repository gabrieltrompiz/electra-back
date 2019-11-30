const { gql } = require('apollo-server');

module.exports.linkTypeDefs = gql`
  extend type Hello {
    user: User
  }
`