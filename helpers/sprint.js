const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Returns the active sprint of an specific workspace
 * @async
 * @function getWorkspaceSprint
 * @param {number} id - workspace id
 * @returns {Promise} sprint - active sprint of the workspace
 */
const getWorkspaceSprint = async id => {
  const client = await pool.connect();
  try {
    const res = (await client.query(queries.getSprintFromWorkspace, [id])).rows[0];
    const _sprint = res ? {
      id: res.sprint_id,
      title: res.sprint_title,
      startDate: res.sprint_start_date,
      finishDate: res.sprint_finish_date,
      status: 'IN_PROGRESS'
    } : null
    return _sprint; 
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
};

/** Returns the backlog of sprint of an specific workspace
 * @async
 * @function getWorkspaceBacklog
 * @param {number} id - workspace id
 * @returns {Promise<Array<object>>} sprints - array of sprints that are now part of the backlog
 */
const getWorkspaceBacklog = async id => {
  const client = await pool.connect();
  try {
    const _backlog = await client.query(queries.getBacklogFromWorkspace, [id]);
    const res = _backlog.rows.map((res) => ({
      id: res.sprint_id,
      title: res.sprint_title,
      startDate: res.sprint_start_date,
      finishDate: res.sprint_finish_date,
      status: 'COMPLETED'
    }));
    return res;
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
};

/** Marks the current sprint of a workspace as completed and sends it to the backlog 
 * @async
 * @function sendSprintToBacklog
 * @param {number} id - sprint backlog
 * @returns {Promise<Array<object>>} id - id of the sprint sent to the backlog
 */
const sendSprintToBacklog = async id => {
  const client = await pool.connect();
  try {
    await client.query(queries.sendSprintToBacklog, [id]);
    return id;
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
};

/** Creates a new active sprint in a workspace 
 * @async
 * @function createSprint
 * @param {number} id - workspace id
 * @returns {Promise} sprint - created sprint
 */
const createSprint = async (sprint) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.createSprint, [sprint.workspaceId, sprint.title, sprint.startDate, sprint.finishDate]);
    return res.rowCount > 0 ? {
      id: res.rows[0].sprint_id,
      title: sprint.title,
      startDate: sprint.startDate,
      finishDate: sprint.finishDate,
      status: 'IN_PROGRESS'
    } : null;
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
};

module.exports = { getWorkspaceSprint, getWorkspaceBacklog, sendSprintToBacklog, createSprint };