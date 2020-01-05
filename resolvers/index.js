const user = require('./user');
const workspace = require('./workspace');
const notification = require('./notification');
const { JSONResolver, DateTimeResolver, NonNegativeIntResolver } = require('graphql-scalars');
const { isAuthenticated, applyMiddleware } = require('../utils/middlewares');

/** Object with all the resolvers, including queries and mutations */
const resolvers = {
  JSON: JSONResolver,
  Date: DateTimeResolver,
  PosInt: NonNegativeIntResolver,
  Query: {
    profile: applyMiddleware(isAuthenticated)(user.getProfile),
    emailExists: user.getUserByEmail,
    usernameExists: user.getUserByUsername,
    users: applyMiddleware(isAuthenticated)(user.search)
  },
  Mutation: {
    register: user.register,
    login: user.login,
    logout: applyMiddleware(isAuthenticated)(user.logout),
    generateGitHubToken: user.generateGitHubToken,
    createWorkspace: applyMiddleware(isAuthenticated)(workspace.createWorkspace),
    createSprint: applyMiddleware(isAuthenticated)(workspace.createSprint),
    sendSprintToBacklog: applyMiddleware(isAuthenticated)(workspace.sendSprintToBacklog),
    createTask: applyMiddleware(isAuthenticated)(workspace.createTask),
    addUserTask: applyMiddleware(isAuthenticated)(workspace.addUserTask),
    removeUserTask: applyMiddleware(isAuthenticated)(workspace.removeUserTask),
    updateTaskStatus: applyMiddleware(isAuthenticated)(workspace.updateTaskStatus),
    updateTaskHours: applyMiddleware(isAuthenticated)(workspace.updateTaskHours),
    deleteTask: applyMiddleware(isAuthenticated)(workspace.deleteTask),
    markNotificationAsRead: applyMiddleware(isAuthenticated)(notification.markAsRead),
    deleteNotification: applyMiddleware(isAuthenticated)(notification.deleteNotification)
  },
  Profile: {
    workspaces: workspace.getWorkspaces,
    notifications: notification.getNotifications
  },
  Workspace: {
    members: workspace.getWorkspaceMembers,
    sprint: workspace.getSprint,
    backlog: workspace.getBacklog
  }
};

module.exports = { resolvers };
