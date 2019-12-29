const { AuthenticationError } = require('apollo-server');
const notificationHelper = require('../helpers/notification');

/** Query to get logged user notifications */
const getNotifications = async (_, __, context) => {
  if(context.getUser()) {
    try {
      return await notificationHelper.getNotifications(context.getUser().id);
    } catch(e) {
      console.log(e.stack);
      throw Error('Could not fetch notifications.')
    }
  } else {
    return new AuthenticationError('Not logged in.')
  }
};

/** Mutation to mark a notification as read */
const markAsRead = async(_, { id }, context) => {
  if(context.getUser()) {
    try {
      return await notificationHelper.markAsRead(id, context.getUser().id);
    } catch(e) {
      console.log(e.stack);
      throw Error('Could not mark as read.')
    }
  } else {
    return new AuthenticationError('Not logged in.');
  }
};

/** Mutation to delete notification */
const deleteNotification = async (_, { id }, context) => {
  if(context.getUser()) {
    try {
      return await notificationHelper.deleteNotification(id, context.getUser().id);
    } catch(e) {
      console.log(e.stack);
      throw Error('Could not delete notification.')
    }
  } else {
    return new AuthenticationError('Not logged in.');
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };