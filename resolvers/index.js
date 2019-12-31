const user = require('./user');
const workspace = require('./workspace');
const notification = require('./notification');
const { JSONResolver, DateTimeResolver } = require('graphql-scalars');

/** Object with all the resolvers, including queries and mutations */
const resolvers = {
  JSON: JSONResolver,
  Date: DateTimeResolver,
  Query: {
    profile: user.getProfile,
    emailExists: user.getUserByEmail,
    usernameExists: user.getUserByUsername
  },
  Mutation: {
    register: user.register,
    login: user.login,
    logout: user.logout,
    generateGitHubToken: user.generateGitHubToken,
    createWorkspace: workspace.createWorkspace,
    createSprint: workspace.createSprint,
    sendSprintToBacklog: workspace.sendSprintToBacklog,
    markNotificationAsRead: notification.markAsRead,
    deleteNotification: notification.deleteNotification
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
