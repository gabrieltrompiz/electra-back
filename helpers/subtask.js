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

module.exports = { getSubtasks };
