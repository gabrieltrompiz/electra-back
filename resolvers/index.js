const user = require('./user');
const workspace = require('./workspace');
const sprint = require('./sprint');
const task = require('./task');
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
    inviteUserToWorkspace: applyMiddleware(isAuthenticated)(workspace.inviteUserToWorkspace),
    createSprint: applyMiddleware(isAuthenticated)(sprint.createSprint),
    sendSprintToBacklog: applyMiddleware(isAuthenticated)(sprint.sendSprintToBacklog),
    createTask: applyMiddleware(isAuthenticated)(task.createTask),
    addUserTask: applyMiddleware(isAuthenticated)(task.addUserTask),
    removeUserTask: applyMiddleware(isAuthenticated)(task.removeUserTask),
    updateTaskStatus: applyMiddleware(isAuthenticated)(task.updateTaskStatus),
    updateTaskHours: applyMiddleware(isAuthenticated)(task.updateTaskHours),
    deleteTask: applyMiddleware(isAuthenticated)(task.deleteTask),
    markNotificationAsRead: applyMiddleware(isAuthenticated)(notification.markAsRead),
    deleteNotification: applyMiddleware(isAuthenticated)(notification.deleteNotification)
  },
  Profile: {
    workspaces: workspace.getWorkspaces,
    notifications: notification.getNotifications
  },
  Workspace: {
    members: workspace.getWorkspaceMembers,
    sprint: sprint.getSprint,
    backlog: sprint.getBacklog
  },
  Task: {
    users: task.getTaskMembers
  }
};

module.exports = { resolvers };
