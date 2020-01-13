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
      endDate: null,
      status: 'IN_PROGRESS'
    } : null
    return _sprint; 
  } catch(e) {
    throw Error(e);
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
      endDate: res.sprint_end_date,
      status: 'COMPLETED'
    }));
    return res;
  } catch(e) {
    throw Error(e);
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
const sendSprintToBacklog = async (sprintId, creatorId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const workspace = await client.query(queries.sendSprintToBacklog, [sprintId]);
    const users = await client.query(queries.getUsersFromWorkspace, [workspace.rows[0].workspace_id]);
    users.rows.forEach(async u => {
      if(creatorId != u.user_id) await client.query(queries.sendNotification, [creatorId, u.user_id, workspace.rows[0].workspace_id, 1, 6]);
    });
    await client.query('COMMIT');
    return sprintId;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
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
const createSprint = async (sprint, creatorId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(queries.createSprint, [sprint.workspaceId, sprint.title, sprint.startDate, sprint.finishDate]);
    if(res.rowCount > 0) {
      const users = await client.query(queries.getUsersFromWorkspace, [sprint.workspaceId]);
      users.rows.forEach(async u => {
        if(creatorId != u.user_id) await client.query(queries.sendNotification, [creatorId, u.user_id, sprint.workspaceId, 1, 5]);
      });
      await client.query('COMMIT');
      return {
        id: res.rows[0].sprint_id,
        title: sprint.title,
        startDate: sprint.startDate,
        finishDate: sprint.finishDate,
        endDate: null,
        status: 'IN_PROGRESS'
      };
    }

    throw new Error();
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { getWorkspaceSprint, getWorkspaceBacklog, sendSprintToBacklog, createSprint };