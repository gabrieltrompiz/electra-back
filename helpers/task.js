const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Returns the active sprint of an specific workspace
 * @async
 * @function createTask
 * @param {Object} task - data needed to create Task
 * @returns {Promise} task created
 */
const createTask = async (task) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const status = task.status === 'TODO' ? 1 : task.status === 'IN_PROGRESS' ? 2 : 3;
    const res = await client.query(queries.createTask, [status, task.sprintId, task.name,
      task.description ? task.description : null, task.estimatedHours, task.issueId ? task.issueId : null ]);

    let taskId = res.rows[0].task_id;
    task.users.forEach(async uid => {
      await client.query(queries.addUserToTask, [uid, taskId, task.sprintId]);
    });
    await client.query('COMMIT');

    return {
      id: res.rows[0].task_id,
      name: task.name,
      estimatedHours: task.estimatedHours,
      loggedHours: 0,
      status: task.status,
      description: task.description
    };
  } catch(e) {
    console.log(e.stack);
    client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

/** Returns the active sprint of an specific workspace
 * @async
 * @function getTaskMembers
 * @param {number} id - task id
 * @returns {Promise} members from a task
 */
const getTaskMembers = async (id) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.getUsersFromTask, [id]);
    return res.rows.map(u => ({
      id: u.user_id,
      fullName: u.user_fullname,
      username: u.user_username,
      pictureUrl: u.user_picture_url,
      email: u.user_email
    }));
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
}

/** Returns the active sprint of an specific workspace
 * @async
 * @function addUserTask
 * @param {number} userId - user id to be added to task
 * @param {number} taskId - task id
 * @returns {Promise} user id if user was added, null otherwise
 */
const addUserTask = async (userId, taskId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.addUserToTask, [userId, taskId]);
    console.log(res.rows[0].user_id);
    return res.rows[0].user_id
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
}

/** Returns the active sprint of an specific workspace
 * @async
 * @function removeUserTask
 * @param {number} userId - user id to be added to task
 * @param {number} taskId - task id
 * @returns {Promise} if promise resolves, always return user id to make know the user was removed
 */
const removeUserTask = async (userId, taskId) => {
  const client = await pool.connect();
  try {
    await client.query(queries.removeUserFromTask, [userId, taskId]);
    return userId;
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
}

const deleteTask = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(queries.removeAllUsersTask, [id]);
    await client.query(queries.deleteTask, [id]);
    await client.query('COMMIT');
    return id;
  } catch(e) {
    console.log(e.stack);
    client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

module.exports = { createTask, getTaskMembers, deleteTask, addUserTask, removeUserTask };