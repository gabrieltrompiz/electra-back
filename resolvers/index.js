const user = require('./user');
const workspace = require('./workspace');
const notification = require('./notification');
const { JSONResolver, DateTimeResolver } = require('graphql-scalars');
const { isAuthenticated, use } = require('../utils/middlewares');

/** Object with all the resolvers, including queries and mutations */
const resolvers = {
  JSON: JSONResolver,
  Date: DateTimeResolver,
  Query: {
    profile: (...args) => use(args, isAuthenticated, user.getProfile),
    emailExists: user.getUserByEmail,
    usernameExists: user.getUserByUsername
  },
  Mutation: {
    register: user.register,
    login: user.login,
    logout: (...args) => use(args, isAuthenticated, user.logout),
    generateGitHubToken: user.generateGitHubToken,
    createWorkspace: (...args) => use(args, isAuthenticated, workspace.createWorkspace),
    createSprint: (...args) => use(args, isAuthenticated, workspace.createSprint),
    sendSprintToBacklog: (...args) => use(args, isAuthenticated, workspace.sendSprintToBacklog),
    markNotificationAsRead: (...args) => use(args, isAuthenticated, notification.markAsRead),
    deleteNotification: (...args) => use(args, isAuthenticated, notification.deleteNotification)
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
