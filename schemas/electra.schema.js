const { gql } = require('apollo-server');

const typeDefs = gql` 
  scalar Date
  scalar JSON
  scalar File
  scalar Image

  enum SprintStatus {
    COMPLETED
    IN_PROGRESS
  }

  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  enum ChatType {
    CHANNEL 
    DIRECT
  }

  enum MessageType {
    TEXT
    FILE
  }

  enum NotificationType {
    INFORMATION
    INVITATION
  }

  type Profile {
    id: ID! 
    username: String!
    fullName: String!
    email: String! 
    gitHubToken: String 
    password: String
    pictureUrl: String!
  }

  type Workspace {
    id: ID! 
    name: String!
    description: String
    members: [Profile]!
  }

  type Sprint {
    id: ID! 
    workspace: Workspace!
    title: String!
    startDate: Date!
    finishDate: Date!
    status: SprintStatus!
  }

  type Task {
    id: ID! 
    name: String!
    description: String!
    estimatedHours: Int
    loggedHours: Int
    remainingHours: Int
    status: TaskStatus!
    comments: [Comment]
    subtasks: [SubTask]
    user: Profile
  }

  type SubTask {
    id: ID! 
    task: Task!
    description: String
    title: String!
    status: Boolean!
  }

  type Comment {
    id: ID! 
    task: Task!
    user: Profile! 
    description: String!
  }

  type Chat {
    id: ID! 
    workspace: Workspace!
    type: ChatType!
    name: String
    description: String
    users: [Profile]!
  }

  type Message {
    id: ID! 
    user: Profile!
    chat: Chat!
    type: MessageType!
    file: File
  }

  type Notification {
    id: ID! 
    user: Profile!
    type: NotificationType!
    description: String!
    read: Boolean!
    meta: JSON
  }

  input RegisterInput {
    username: String!
    fullName: String!
    email: String!
    gitHubToken: String
    password: String!
    pictureUrl: String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type Query {
    profile: Profile!
  }

  type Mutation {
    register(user: RegisterInput!): Profile!
    login(user: LoginInput!): Profile
  }
`

module.exports = { typeDefs }