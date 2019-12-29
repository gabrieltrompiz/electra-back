const { gql } = require('apollo-server');

const typeDefs = gql` 
  scalar JSON
  scalar Date

  enum SprintStatus {
    COMPLETED
    IN_PROGRESS
  }

  enum WorkspaceRole {
    ADMIN
    MEMBER
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
    workspaces: [Workspace]
    notifications: [Notification]
  }

  type Workspace {
    id: ID! 
    name: String!
    description: String
    members: [Member]!
  }

  type Member {
    user: Profile!
    role: WorkspaceRole!
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
    file: String!
  }

  type Notification {
    id: ID! 
    receiver: ID!
    type: NotificationType!
    description: String!
    read: Boolean!
    meta: JSON
  }

  type TokenPayload {
    code: String!
  }

  type ExistsPayload {
    exists: Boolean!
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

  input WorkspaceInput {
    name: String!
    description: String
    members: [MemberInput]!
  }

  input MemberInput {
    id: ID!
    role: WorkspaceRole!
  }

  type Query {
    profile: Profile!
    emailExists(email: String!): ExistsPayload!
    usernameExists(username: String!): ExistsPayload!
  }

  type Mutation {
    register(user: RegisterInput!): Profile!
    login(user: LoginInput!): Profile,
    logout: ID,
    generateGitHubToken(code: String!): TokenPayload!
    createWorkspace(workspace: WorkspaceInput!): Workspace!
    markNotificationAsRead(id: ID!): ID,
    deleteNotification(id: ID!): ID
  }
`

module.exports = { typeDefs }