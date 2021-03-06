const pool = require('../utils/db');
const queries = require('../utils/queries');

const getSubtasks = async (taskId) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.getSubtasks, [taskId]);
    return res.rows.map(s => ({
      id: s.subtask_id,
      description: s.subtask_description,
      status: s.subtask_status
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

const createSubtask = async ({ description, taskId }, creatorId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(queries.createSubtask, [description, taskId]);
    const resUser = (await client.query(queries.getUserFromTask, [taskId]));
    
    if(resUser.rowCount > 0) {
      if(creatorId != resUser.rows[0].user_id) await client.query(queries.sendNotification, [creatorId, resUser.rows[0].user_id, taskId, 3, 10]);
    }
    
    await client.query('COMMIT');

    return {
      id: res.rows[0].subtask_id,
      description,
      status: false
    }
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
}

const editSubtask = async (description, id) => {
  const client = await pool.connect();
  try {
    const res = (await client.query(queries.editSubtask, [description, id])).rows[0];
    if(!res) throw new Error();
    return {
      id: res.subtask_id,
      description: res.subtask_description,
      status: res.subtask_status
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

const setStatus = async (status, id) => {
  const client = await pool.connect();
  try {
    const res = (await client.query(queries.setSubtaskStatus, [status, id])).rows[0];
    if(!res) throw new Error();
    return {
      id: res.subtask_id,
      description: res.subtask_description,
      status: res.subtask_status
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

const deleteSubtask = async (id) => {
  const client = await pool.connect();
  try {
    await client.query(queries.deleteSubtask, [id]);
    return id;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

module.exports = { getSubtasks, createSubtask, editSubtask, setStatus, deleteSubtask };