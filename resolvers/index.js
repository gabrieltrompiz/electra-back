const user = require('./user');
const workspace = require('./workspace');
const sprint = require('./sprint');
const task = require('./task');
const comment = require('./comment');
const subtask = require('./subtask');
const chat = require('./chat');
const message = require('./message');
const notification = require('./notification');
const { JSONResolver, DateTimeResolver, NonNegativeIntResolver } = require('graphql-scalars');
const { isAuthenticated, isLoggedOut, applyMiddleware } = require('../utils/middlewares');

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
    register: applyMiddleware(isLoggedOut)(user.register),
    login: applyMiddleware(isLoggedOut)(user.login),
    logout: applyMiddleware(isAuthenticated)(user.logout),
    editProfile: applyMiddleware(isAuthenticated)(user.editProfile),
    generateGitHubToken: user.generateGitHubToken,
    createWorkspace: applyMiddleware(isAuthenticated)(workspace.createWorkspace),
    searchWorkspace: applyMiddleware(isAuthenticated)(workspace.searchWorkspace),
    inviteUserToWorkspace: applyMiddleware(isAuthenticated)(workspace.inviteUserToWorkspace),
    editWorkspace: applyMiddleware(isAuthenticated)(workspace.editWorkspace),
    addUserToWorkspace: applyMiddleware(isAuthenticated)(workspace.addUserToWorkspace),
    removeUserFromWorkspace: applyMiddleware(isAuthenticated)(workspace.removeUserFromWorkspace),
    exitFromWorkspace: applyMiddleware(isAuthenticated)(workspace.exitFromWorkspace),
    setWorkspaceUserRole: applyMiddleware(isAuthenticated)(workspace.setWorkspaceUserRole),
    deleteWorkspace: applyMiddleware(isAuthenticated)(workspace.deleteWorkspace),
    createSprint: applyMiddleware(isAuthenticated)(sprint.createSprint),
    sendSprintToBacklog: applyMiddleware(isAuthenticated)(sprint.sendSprintToBacklog),
    createTask: applyMiddleware(isAuthenticated)(task.createTask),
    changeUserTask: applyMiddleware(isAuthenticated)(task.changeUserTask),
    changeTaskDescription: applyMiddleware(isAuthenticated)(task.changeTaskDescription),
    changeTaskIssue: applyMiddleware(isAuthenticated)(task.changeTaskIssue),
    updateTaskStatus: applyMiddleware(isAuthenticated)(task.updateTaskStatus),
    updateTaskHours: applyMiddleware(isAuthenticated)(task.updateTaskHours),
    deleteTask: applyMiddleware(isAuthenticated)(task.deleteTask),
    createSubTask: applyMiddleware(isAuthenticated)(subtask.createSubtask),
    editSubTask: applyMiddleware(isAuthenticated)(subtask.editSubtask),
    setSubTaskStatus: applyMiddleware(isAuthenticated)(subtask.setStatus),
    deleteSubTask: applyMiddleware(isAuthenticated)(subtask.deleteSubtask),
    createComment: applyMiddleware(isAuthenticated)(comment.createComment),
    editComment: applyMiddleware(isAuthenticated)(comment.editComment),
    deleteComment: applyMiddleware(isAuthenticated)(comment.deleteComment),
    markNotificationAsRead: applyMiddleware(isAuthenticated)(notification.markAsRead),
    deleteNotification: applyMiddleware(isAuthenticated)(notification.deleteNotification),
    sendMessage: applyMiddleware(isAuthenticated)(message.createMessage),
    deleteMessage: applyMiddleware(isAuthenticated)(message.deleteMessage)
  },
  Profile: {
    workspaces: workspace.getWorkspaces,
    notifications: notification.getNotifications
  },
  Workspace: {
    members: workspace.getWorkspaceMembers,
    sprint: sprint.getSprint,
    backlog: sprint.getBacklog,
    chats: chat.getWorkspaceChats
  },
  Sprint: {
    tasks: task.getTasks,
  },
  Task: {
    user: task.getTaskUser,
    subtasks: subtask.getSubtasks,
    comments: comment.getComments
  },
  Chat: {
    // users: chat.getChatUsers,
    messages: message.getChatMessages
  },
  Message: {
    user: message.getMessageUser
  }
};

module.exports = { resolvers };
