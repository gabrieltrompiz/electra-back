const notificationHelper = require('../helpers/notification');

/** Query to get logged user notifications */
const getNotifications = async (_, __, context) => {
  try {
    return await notificationHelper.getNotifications(context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not fetch notifications.')
  }
};

/** Mutation to mark a notification as read */
const markAsRead = async(_, { id }, context) => {
  try {
    return await notificationHelper.markAsRead(id, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not mark as read.')
  }
};

/** Mutation to delete notification */
const deleteNotification = async (_, { id }, context) => {
  try {
    return await notificationHelper.deleteNotification(id, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not delete notification.')
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };