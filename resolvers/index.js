const user = require('./user');
const workspace = require('./workspace');
const notification = require('./notification');
const { JSONResolver } = require('graphql-scalars');

/** Object with all the resolvers, including queries and mutations */
const resolvers = {
  JSON: JSONResolver,
  Query: {
    profile: user.getProfile,
    emailExists: user.getUserByEmail,
    usernameExists: user.getUserByUsername
  },
  Mutation: {
    register: user.register,
    login: user.login,
    generateGitHubToken: user.generateGitHubToken,
    createWorkspace: workspace.createWorkspace,
    markNotificationAsRead: notification.markAsRead,
    deleteNotification: notification.deleteNotification
  },
  Profile: {
    workspaces: workspace.getWorkspaces,
    notifications: notification.getNotifications
  },
  Workspace: {
    members: workspace.getWorkspaceMembers
  }
};

module.exports = { resolvers };