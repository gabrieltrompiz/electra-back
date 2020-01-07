const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Creates a new workspace  
 * @function createWorkspace
 * @param {Object} workspace - Workspace data needed to create workspace
 * @param {creator} - User owner of the workspace
 * @returns {Promise<object>} workspace - Object of workspace
 */
const createWorkspace = async ({ name, description, repoOwner, repoName, members }, creator) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(queries.createWorkspace, [name, description, repoOwner, repoName]);
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
            description
          },
          sender: creator,
          role: m.role
        }
        await client.query(queries.sendInvitation, [m.id, desc, meta]);
      }
    });
    await client.query('COMMIT');
    return {
      id,
      name,
      description
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

/** Sends invitations to users to join a workspace
 * @async
 * @function inviteUserToWorkspace
 * @param {Array} users - List of users to send notification
 * @param {workspaceId} - Workspace Id
 * @param {creator} - User owner or admin of the workspace
 * @returns {Promise<Array<object>>} members - array of members of the workspace
 */
const inviteUserToWorkspace = async (users, workspaceId, creator) => {
  const client = await pool.connect();
  try {
    const workspace = (await client.query(queries.getWorkspace, [work])).rows[0];
    users.map(async u => {
      const desc = `${creator} invited you to join ${workspace.workspace_name}`;
      const meta = {
        workspace: {
          workspace: workspace.id,
          name: workspace.name,
          description: workspace.description
        },
        sender: creator.fullName,
        role: u.role
      };
      await client.query(queries.sendInvitation, [u.id, desc, meta]);
    });

    return null;
  } catch(e) {
    console.log(e.stack)
  } finally {
    client.release();
  }
}

module.exports = { createWorkspace, getWorkspaces, getWorkspaceMembers, inviteUserToWorkspace };

