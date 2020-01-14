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
const markAsRead = async (_, { id }, context) => {
  try {
    return await notificationHelper.markAsRead(id, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not mark as read.')
  }
};

const markAllAsRead = async (_, __, context) => {
  try {
    return await notificationHelper.markAllAsRead(context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not mark all as read.')
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

const getNotificationUser = async (parent) => {
  try {
    return await notificationHelper.getNotificationUser(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get notification user');
  }
};

const getTargetType = (obj, ctx, info) => {
  if(obj.hasOwnProperty('repoOwner')) return 'Workspace';
  if(obj.hasOwnProperty('estimatedHours')) return 'Task';
  if(obj.hasOwnProperty('startDate')) return 'Sprint';
  return null;
};

const getTarget = async (parent) => {
  try {
    switch(parent.typeTarget) {
      case 1: return await notificationHelper.getNotificationWorkspace(parent.target);
      case 2: return await notificationHelper.getNotificationSprint(parent.target);
      case 3: return await notificationHelper.getNotificationTask(parent.target);
      default: throw new Error();
    }
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get notification target');
  }
}

module.exports = { getNotifications, markAsRead, deleteNotification, getTargetType, getNotificationUser, getTarget, markAllAsRead };