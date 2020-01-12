const { gql } = require('apollo-server');

module.exports.linkTypeDefs = gql`
  extend type Profile {
    gitHubUser: User
  }

  extend type Workspace {
    repo: Repository
  }

  extend type Task {
    issue: Issue
  }
`