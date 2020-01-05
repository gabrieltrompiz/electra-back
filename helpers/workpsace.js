const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Creates a new workspace  
 * @function createWorkspace
 * @param {object} workspace - Workspace data needed to create workspace
 * @returns {Promise<object>} workspace - Object of workspace
 */
const createWorkspace = async ({ name, description, repo, members }, creator) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(queries.createWorkspace, [name, description, repo]);
    const id = result.rows[0].workspace_id;
    members.forEach(async (m) => {
      if(m.id === creator.id) {
        await client.query(queries.addUserToWorkspace, [id, m.id, m.role === 'ADMIN' ? 1 : 2]);
      } else {
        const desc = `${creator.fullName} invited you to join ${name}`;
        const meta = {
          workspace: {
            id,
            name,
            description, 
            repo
          },
          sender: creator
        }
        await client.query(queries.sendInvitation, [m.id, desc, meta]);
      }
    });
    await client.query('COMMIT');
    return {
      id,
      name,
      description,
      repo
    };
  } catch(e) {
    console.log(e.stack);
    client.query('ROLLBACK');
  } finally {
    client.release();
  }
};

/** Returns the workspaces the user logged in is member of 
 * @async
 * @function getWorkspaces
 * @param {number} id - User id
 * @returns {Promise<Array<object>>} workspaces - Array of objects of workspace
 */
const getWorkspaces = async id => {
  const client = await pool.connect();
  try {
    const _workspaces = await client.query(queries.getWorkspacesFromUser, [id]);
    return _workspaces.rows.map((r) => ({
      id: r.workspace_id,
      name: r.workspace_name,
      description: r.workspace_description,
      repo: r.workspace_repo_id,
    }));
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
};

/** Returns an array of members that are part of an specific workspace
 * @async
 * @function getWorkspaceMembers
 * @param {number} id - workspace id
 * @returns {Promise<Array<object>>} members - array of members of the workspace
 */
const getWorkspaceMembers = async id => {
  const client = await pool.connect();
  try {
    const _members = await client.query(queries.getUsersFromWorkspace, [id]);
    return _members.rows.map((m) => ({
      user: {
        id: m.user_id,
        username: m.user_username,
        fullName: m.user_fullname,
        email: m.user_email,
        pictureUrl: m.user_picture_url
      },
      role: m.type_user_workspace_id === 1 ? 'ADMIN' : 'MEMBER'
    }));
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
};

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
    const _sprint = res ?  {
      id: res.sprint_id,
      title: res.sprint_title,
      startDate: res.sprint_start_date,
      endDate: res.sprint_finish_date,
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
    return _backlog.rows.map((res) => ({
      id: res.sprint_id,
      title: res.sprint_title,
      startDate: res.sprint_start_date,
      endDate: res.sprint_finish_date,
      status: 'COMPLETED'
    }));
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
}

/** Creates a new active sprint in a workspace 
 * @async
 * @function createSprint
 * @param {number} id - workspace id
 * @returns {Promise} sprint - created sprint
 */
const createSprint = async (sprint) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.createSprint, [sprint.workspaceId, sprint.title, sprint.start, sprint.finish]);
    return res.rowCount > 0 ? {
      id: res.rows[0].sprint_id,
      title: sprint.title,
      startDate: sprint.start,
      finishDate: sprint.finish,
      status: 'IN_PROGRESS'
    } : null;
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
}

const createTask = async (task) => {
  const client = await pool.connect();
  try {
    const status = task.status === 'TODO' ? 1 : task.status === 'IN_PROGRESS' ? 2 : 3;
    const res = await client.query(queries.createTask, [status, task.sprintId, task.name,
      task.description, task.estimatedHours, task.issueId ? task.issueId : null ]);
    return {
      id: res.rows[0].task_id,
      name: task.name,
      description: task.description,
      estimatedHours: task.estimatedHours,
      loggedHours: 0,
      status: status
    };
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
}

// const sendSprintToBacklog = async id => {
//   const client = await pool.connect();
//   try {
//     await client.query(queries.sendSprintToBacklog, [id]);
//     return id;
//   } catch(e) {
//     console.log(e.stack)
//   } finally {
//     client.release();
//   }
// }

// const sendSprintToBacklog = async id => {
//   const client = await pool.connect();
//   try {
//     await client.query(queries.sendSprintToBacklog, [id]);
//     return id;
//   } catch(e) {
//     console.log(e.stack)
//   } finally {
//     client.release();
//   }
// }

// const sendSprintToBacklog = async id => {
//   const client = await pool.connect();
//   try {
//     await client.query(queries.sendSprintToBacklog, [id]);
//     return id;
//   } catch(e) {
//     console.log(e.stack)
//   } finally {
//     client.release();
//   }
// }

// const sendSprintToBacklog = async id => {
//   const client = await pool.connect();
//   try {
//     await client.query(queries.sendSprintToBacklog, [id]);
//     return id;
//   } catch(e) {
//     console.log(e.stack)
//   } finally {
//     client.release();
//   }
// }

// const sendSprintToBacklog = async id => {
//   const client = await pool.connect();
//   try {
//     await client.query(queries.sendSprintToBacklog, [id]);
//     return id;
//   } catch(e) {
//     console.log(e.stack)
//   } finally {
//     client.release();
//   }
// }

// const sendSprintToBacklog = async id => {
//   const client = await pool.connect();
//   try {
//     await client.query(queries.sendSprintToBacklog, [id]);
//     return id;
//   } catch(e) {
//     console.log(e.stack)
//   } finally {
//     client.release();
//   }
// }

module.exports = { createWorkspace, getWorkspaces, getWorkspaceMembers, getWorkspaceSprint, getWorkspaceBacklog, sendSprintToBacklog, createSprint };

