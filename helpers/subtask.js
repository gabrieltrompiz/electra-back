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
    console.log(e.stack);
  } finally {
    client.release();
  }
}

const createSubtask = async ({ description, taskId }) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.createSubtask, [description, taskId]);
    return {
      id: res.rows[0].subtask_id,
      description,
      status: false
    }
  } catch(e) {
    console.log(e.stack);
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
    console.log(e.stack);
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
    console.log(e.stack);
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
    console.log(e.stack);
    throw Error(e);
  } finally {
    client.release();
  }
}

module.exports = { getSubtasks, createSubtask, editSubtask, setStatus, deleteSubtask };