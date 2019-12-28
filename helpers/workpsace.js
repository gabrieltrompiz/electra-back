const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Creates a new workspace  
 * @function createWorkspace
 * @param {object} workspace - Workspace data needed to create workspace
 * @returns {Promise<object>} workspace - Object of workspace
 */
const createWorkspace = async ({ name, description, repo, members }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(queries.createWorkspace, [name, description, repo]);
    const id = result.rows[0].workspace_id;
    await members.forEach(async (m) => {
      await client.query(queries.addUserToWorkspace, [id, m.id, m.role === 'ADMIN' ? 1 : 2]);
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
    return await Promise.all(_workspaces.rows.map(async (r) => {
      return ({
        id: r.workspace_id,
        name: r.workspace_name,
        description: r.workspace_description,
        repo: r.workspace_repo_id,
      })
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
    return await Promise.all(_members.rows.map(async (m) => 
      ({
        user: {
          id: m.user_id,
          username: m.user_username,
          fullName: m.user_fullname,
          email: m.user_email,
          pictureUrl: m.user_picture_url
        },
        role: m.type_user_workspace_id === 1 ? 'ADMIN' : 'MEMBER'
      })
    ));
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
};

module.exports = { createWorkspace, getWorkspaces, getWorkspaceMembers };