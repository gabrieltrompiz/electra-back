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

const getWorkspaceSprint = async id => {
  const client = await pool.connect();
  try {
    const res = (await client.query(queries.getSprintFromWorkspace, [id])).rows[0];
    const _sprint = {
      id: res.sprint_id,
      title: res.sprint_title,
      startDate: res.sprint_start_date,
      endDate: res.sprint_finish_date,
      status: 'IN_PROGRESS'
    }
    return { _sprint }; 
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
};

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

const createSprint = async (sprint) => {
  const client = await pool.connect();
  try {
    const res = await client.query(queries.createSprint, [sprint.workspaceId, sprint.title, sprint.start, sprint.finish]);
    return {
      id: res.rows[0].sprint_id,
      title: sprint.title,
      startDate: sprint.start,
      finishDate: sprint.finish,
      status: 'IN_PROGRESS'
    };
  } catch(e) {
    console.log(e.stack);
  } finally {
    client.release();
  }
}

module.exports = { createWorkspace, getWorkspaces, getWorkspaceMembers, getWorkspaceSprint, getWorkspaceBacklog, sendSprintToBacklog, createSprint };
