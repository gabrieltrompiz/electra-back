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
      receiver: id,
      type: n.type_notification_id === 2 ? 'INVITATION' : 'INFORMATION',
      description: n.notification_description,
      meta: n.notification_meta,
      read: n.notification_read
    }));
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
};

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
    console.log(e.stack);
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
    console.log(e.stack);
  } finally {
    client.release();
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };