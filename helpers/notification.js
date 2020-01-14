const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Fetches all notifications from an user
 * @async
 * @function getNotifications
 * @param {number} id - User id
 * @returns {Promise<Array<object>>} notifications - Promise that resolves to an array of notifications
 */
const getNotifications = async id => {
  const client = await pool.connect();
  try {
    const _notifications = await client.query(queries.getNotifications, [id]);
    return _notifications.rows.map((n) => ({
      id: n.notification_id,
      type: getNotificationType(n.type_notification_id),
      read: n.notification_read,
      date: n.notification_date,
      typeTarget: n.type_target_id,
      target: n.target_id
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getNotificationType = (id) => {
  switch(id) {
    case 1: return 'INVITED_TO_WORKSPACE';
    case 2: return 'KICKED_FROM_WORKSPACE';
    case 3: return 'CHANGED_WORKSPACE_ROLE';
    case 4: return 'WORKSPACE_DELETED';
    case 5: return 'CREATED_SPRINT';
    case 6: return 'SPRINT_TO_BACKLOG';
    case 7: return 'ASSIGNED_TASK';
    case 8: return 'CHANGED_TASK_STATUS';
    case 9: return 'CREATED_TASK_COMMENT';
    case 10: return 'CREATED_TASK_SUBTASK';
    default: return null;
  }
}

/** Marks a notification as read
 * @async
 * @function markAsRead
 * @param {number} id - Notification id
 * @param {number} asker - id from the logged user to check if the notification belongs to that user
 * @returns {Promise<number>} id - id of the notification modified
 */
const markAsRead = async (id, asker) => {
  const client = await pool.connect();
  try {
    await client.query(queries.markAsRead, [id, asker]);
    return id;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const markAllAsRead = async (id) => {
  const client = await pool.connect();
  try {
    await client.query(queries.markAllAsRead, [id]);
    return true;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

/** Deletes a notification
 * @async
 * @function deleteNotification
 * @param {number} id - Notification id
 * @param {number} asker - id from the logged user to check if the notification belongs to that user
 * @returns {Promise<number>} id - id of the notification deleted
 */
const deleteNotification = async (id, asker) => {
  const client = await pool.connect();
  try {
    await client.query(queries.deleteNotification, [id, asker]);
    return id;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getNotificationUser = async (id) => {
  const client = await pool.connect();
  try {
    const u = (await client.query(queries.getNotificationUser, [id])).rows[0];
    return {
      id: u.user_id,
      fullName: u.user_fullname,  
      username: u.user_username,
      email: u.user_email,
      pictureUrl: u.user_picture_url
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getNotificationWorkspace = async id => {
  const client = await pool.connect();
  try {
    const w = await client.query(queries.getWorkspace, [id]);
    return {
      id: w.rows[0].workspace_id,
      name: w.rows[0].workspace_name,
      description: w.rows[0].workspace_description,
      repoOwner: w.rows[0].workspace_repo_owner,
      repoName: w.rows[0].workspace_repo_name,
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getNotificationSprint = async id => {
  const client = await pool.connect();
  try {
    const s = (await client.query(queries.getSprint, [id])).rows[0];
    return {
      id: s.sprint_id,
      title: s.sprint_title,
      startDate: s.sprint_start_date,
      finishDate: s.sprint_finish_date,
      endDate: s.sprint_end_date,
      sprintStatus: s.sprint_status == 1 ? 'COMPLETED' : 'IN_PROGRESS'
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getNotificationTask = async id => {
  const client = await pool.connect();
  try {
    const t = (await client.query(queries.getTask, [id])).rows[0];
    return {
      id: t.task_id,
      name: t.task_name,
      estimatedHours: t.task_estimated_hours,
      loggedHours: t.task_logged_hours,
      status: t.task_status_id == 1 ? 'TODO' : t.task_status_id == 2 ? 'IN_PROGRESS' : 'DONE',
      description: t.task_description
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification, getNotificationUser, getNotificationWorkspace, getNotificationSprint, getNotificationTask,
  markAllAsRead };