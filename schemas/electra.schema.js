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
    INFO
  }

  enum NotificationType {
    INVITED_TO_WORKSPACE
    KICKED_FROM_WORKSPACE
    CHANGED_WORKSPACE_ROLE
    WORKSPACE_DELETED
    CREATED_SPRINT
    SPRINT_TO_BACKLOG
    ASSIGNED_TASK
    CHANGED_TASK_STATUS
    CREATED_TASK_COMMENT
    CREATED_TASK_SUBTASK
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
    chats: [Chat]
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
    endDate: Date
    sprintStatus: SprintStatus!
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
    user: Profile
  }

  input TaskInput {
    sprintId: ID!
    status: TaskStatus!
    name: String!
    description: String!
    estimatedHours: PosInt
    issueId: ID,
    user: ID
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
    type: ChatType!
    name: String
    description: String
    users: [Profile]!
    messages: [Message]
  }

  type Message {
    id: ID! 
    user: Profile!
    type: MessageType!
    content: String!
    date: Date!
  }

  input MessageInput {
    chatId: ID!
    type: MessageType!
    content: String!
  }

  union NotificationTarget = Workspace | Sprint | Task

  type Notification {
    id: ID!
    type: NotificationType!
    read: Boolean!
    sender: Profile!
    target: NotificationTarget!
    date: Date!
    # typeTarget: ID
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
    userId: ID
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
    workspace(id: ID!): Workspace
  }

  type Mutation {
    register(user: RegisterInput!): Profile!
    login(user: LoginInput!): Profile
    logout: ID
    editProfile(profile: EditProfileInput): Profile!
    generateGitHubToken(code: String!): TokenPayload!
    
    createWorkspace(workspace: WorkspaceInput!): Workspace!
    searchWorkspace(search: String!): [Workspace]
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
    changeUserTask(input: UserTaskInput!): ID
    changeTaskDescription(taskId: ID! description: String!): Task!
    changeTaskIssue(taskId: ID! issueId: ID): ID
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

    changeGeneralChatDescription(workspaceId: ID!, description: String!): Chat

    sendMessage(message: MessageInput!): Message!
    deleteMessage(messageId: ID!): ID
    
    markNotificationAsRead(id: ID!): ID
    markAllNotificationsAsRead: Boolean
    deleteNotification(id: ID!): ID
  }
`

module.exports = { typeDefs }