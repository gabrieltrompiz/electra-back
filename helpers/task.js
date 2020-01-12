const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Creates a task and returns it
 * @async
 * @function createTask
 * @param {Object} task - data needed to create Task
 * @returns {Promise} task
 */
const createTask = async (task, senderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const status = task.status === 'TODO' ? 1 : task.status === 'IN_PROGRESS' ? 2 : 3;
    
    const res = await client.query(queries.createTask, [status, task.sprintId, task.name,
      task.description ? task.description : null, task.estimatedHours, task.issueId ? task.issueId : null ]);
    await client.query(queries.changeUserTask, [task.user, res.rows[0].task_id]);

    if(task.user && task.user != senderId) {
      await client.query(queries.sendNotification, [senderId, task.user, res.rows[0].sprint_id, 2, 7]);
    }

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
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
}

/** Returns the members of a task
 * @async
 * @function getTaskUser
 * @param {number} id - task id
 * @returns {Promise} members
 */
const getTaskUser = async (id) => {
  const client = await pool.connect();
  try {
    const u = (await client.query(queries.getUserFromTask, [id])).rows[0];
    return u ? {
      id: u.user_id,
      fullName: u.user_fullname,
      username: u.user_username,
      pictureUrl: u.user_picture_url,
      email: u.user_email
    }: null;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

/** Adds a user to a task and returns its id if successful, null otherwise
 * @async
 * @function changeUserTask
 * @param {number} userId - user id to be added to task
 * @param {number} taskId - task id
 * @returns {Promise} user_id
 */
const changeUserTask = async (userId, taskId, senderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(queries.changeUserTask, [userId, taskId]);
    if(res.rowCount == 0 && userId) throw new Error();
    
    if(userId && senderId != userId) {
      const sprintId = (await client.query(queries.getTask, [taskId])).rows[0].sprint_id;
      await client.query(queries.sendNotification, [senderId, userId, sprintId, 2, 7]);
    }
    await client.query('COMMIT');

    return res.rows[0] ? res.rows[0].user_id : null;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
}

/** Updates task status and returns it
 * @async
 * @function updateTaskStatus
 * @param {number} taskId - task id to update
 * @param {number} status - status to be set
 * @returns {Promise} status
 */
const updateTaskStatus = async (taskId, status, senderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const statusId = status === 'TODO' ? 1 : status === 'IN_PROGRESS' ? 2 : 3;
    
    const task = (await client.query(queries.updateTaskStatus, [statusId, taskId])).rows[0];

    if(task.user_id && senderId != task.user_id) {
      await client.query(queries.sendNotification, [senderId, task.user_id, task.sprint_id, 2, 8]);
    }
    await client.query('COMMIT');
    
    return status;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
}

/** If successful, returns total hours spent, null otherwise
 * @async
 * @function updateTaskHours
 * @param {number} taskId - task id
 * @param {number} hours - hours to aad to the task
 * @returns {Promise} hours
 */
const updateTaskHours = async (taskId, hours) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.updateTaskHours, [hours, taskId]);
    return res.rows[0].hours;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

/** Returns task id and deletes it if exists
 * @async
 * @function updateTaskHours
 * @param {number} id - task id
 * @returns {Promise} task id
 */
const deleteTask = async (id) => {
  const client = await pool.connect();
  try {
    await client.query(queries.deleteTask, [id]);
    return id;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

const getTaskList = async (sprintId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.getTaskList, [sprintId]);
    return res.rows.map(t => ({
      id: t.task_id,
      name: t.task_name,
      estimatedHours: t.task_estimated_hours,
      loggedHours: t.task_logged_hours,
      status: t.task_status_id == 1 ? 'TODO' : t.task_status_id == 2 ? 'IN_PROGRESS' : 'DONE',
      description: t.task_description
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

const changeTaskDescription = async (taskId, description) => {
  const client = await pool.connect();
  try {
    const task = (await client.query(queries.changeTaskDescription, [description, taskId])).rows[0];
    return {
      id: taskId,
      status: task.task_status_id === 1 ? 'TODO' : task.task_status_id === 2 ? 'IN_PROGRESS' : 'DONE',
      name: task.task_name,
      description: task.task_description,
      estimatedHours: task.task_estimated_hours,
      loggedHours: task.task_logged_hours
    };
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

module.exports = { createTask, getTaskUser, deleteTask, changeUserTask,
  updateTaskStatus, updateTaskHours, getTaskList, changeTaskDescription };