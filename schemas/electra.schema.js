const { gql } = require('apollo-server');

const typeDefs = gql` 
  scalar JSON
  scalar Date
  scalar PosInt

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
    description: String!
    members: [Member]
    backlog: [Sprint]
    sprint: Sprint
  }

  type Member {
    user: Profile!
    role: WorkspaceRole!
  }

  type Sprint {
    id: ID!
    title: String!
    startDate: Date!
    finishDate: Date!
    status: SprintStatus!
    tasks: [Task]
  }

  type Task {
    id: ID! 
    name: String!
    estimatedHours: Int!
    loggedHours: Int!
    status: TaskStatus!
    description: String!
    comments: [TaskComment]
    subtasks: [SubTask]
    users: [Profile]
  }

  input TaskInput {
    sprintId: ID!
    status: TaskStatus!
    name: String!
    description: String!
    estimatedHours: PosInt
    issueId: ID,
    users: [ID]!
  }

  type SubTask {
    id: ID!
    description: String!
    status: Boolean!
  }

  input SubTaskInput {
    description: String!
    taskId: ID!
  }

  type TaskComment {
    id: ID!
    user: Profile!
    description: String!
  }

  input CommentInput {
    taskId: ID!
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

  input EditProfileInput {
    fullName: String!
    username: String!
    email: String!
    pictureUrl: String!
    gitHubToken: String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input WorkspaceInput {
    name: String!
    description: String
    members: [MemberInput]!
    repoOwner: String
    repoName: String
  }

  input EditWorkspaceInput {
    id: ID!
    name: String!
    description: String
    repoOwner: String
    repoName: String
  }

  input SprintInput {
    title: String!
    startDate: Date!
    finishDate: Date!
    workspaceId: ID!
  }

  input MemberInput {
    id: ID!
    role: WorkspaceRole!
  }

  input UserTaskInput {
    userId: ID!
    taskId: ID!
  }

  input UserWorkspaceInput {
    userId: ID!
    workspaceId: ID!
    role: WorkspaceRole!
  }

  type Query {
    profile: Profile!
    emailExists(email: String!): ExistsPayload!
    usernameExists(username: String!): ExistsPayload!
    users(search: String!): [Profile]
  }

  type Mutation {
    register(user: RegisterInput!): Profile!
    login(user: LoginInput!): Profile
    logout: ID
    editProfile(profile: EditProfileInput): Profile!
    generateGitHubToken(code: String!): TokenPayload!
    
    createWorkspace(workspace: WorkspaceInput!): Workspace!
    inviteUserToWorkspace(users: [MemberInput]!, workspace: ID!): ID
    editWorkspace(workspace: EditWorkspaceInput!): Workspace!
    addUserToWorkspace(input: UserWorkspaceInput!): ID
    removeUserFromWorkspace(userId: ID!, workspaceId: ID!): ID
    exitFromWorkspace(workspaceId: ID!): ID
    setWorkspaceUserRole(input: UserWorkspaceInput!): ID
    deleteWorkspace(workspaceId: ID!): ID

    createSprint(sprint: SprintInput!): Sprint
    sendSprintToBacklog(id: ID!): ID
    
    createTask(task: TaskInput!): Task!
    addUserTask(input: UserTaskInput!): ID
    removeUserTask(input: UserTaskInput!): ID
    updateTaskStatus(taskId: ID!, status: TaskStatus!): TaskStatus
    updateTaskHours(taskId: ID!, hours: Int!): Int
    deleteTask(id: ID!): ID

    createSubTask(subTask: SubTaskInput!): SubTask!
    editSubTask(description: String!, subTaskId: ID!): SubTask!
    setSubTaskStatus(status: Boolean! subTaskId: ID!): SubTask!
    deleteSubTask(subTaskId: ID!): ID

    createComment(comment: CommentInput!): TaskComment!
    editComment(commentId: ID!, description: String!): TaskComment!
    deleteComment(commentId: ID): ID
    
    markNotificationAsRead(id: ID!): ID
    deleteNotification(id: ID!): ID
  }
`

module.exports = { typeDefs }