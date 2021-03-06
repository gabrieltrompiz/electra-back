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
        await client.query(queries.sendNotification, [creator.id, m.id, id, 1, 1]);
      }
    });
    const chatId = (await client.query(queries.createChannel, [id, 'general', 'General channel for all the users to participate.'])).rows[0].chat_id;
    await client.query(queries.addUserToChat, [creator.id, chatId]);
    await client.query('COMMIT');
    return {
      id,
      name,
      description
    };
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
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
      repoOwner: r.workspace_repo_owner,
      repoName: r.workspace_repo_name,
    }));
  } catch(e) {
    throw Error(e);
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
    throw Error(e);
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
    await client.query('BEGIN');
    users.forEach(async u => await client.query(queries.sendNotification, [creator, u.id, workspaceId, 1, 1]));
    await client.query('COMMIT');
    return workspaceId;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
}

/** Edits workspace and return its data
 * @async
 * @function editWorkspace
 * @param {Object} workspace - workspace data
 * @returns {Promise<object>} workspace
 */
const editWorkspace = async ({ id, name, description, repoOwner, repoName }) => {
  const client = await pool.connect();
  try {
    await client.query(queries.editWorkspace, [name, description, repoOwner, repoName, id]);
    return {
      id,
      name,
      description,
      repoOwner,
      repoName
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const addUserToWorkspace = async (userId, workspaceId, role) => {
  const client = await pool.connect();
  try {
    
    await client.query('BEGIN');
    await client.query(queries.addUserToWorkspace, [workspaceId, userId, role == 'ADMIN' ? 1 : 2]);
    await client.query(queries.addUserToGeneralChat, [userId, workspaceId]);
    await client.query(queries.deleteInvitations, [userId, workspaceId]);
    await client.query('COMMIT');
    return userId;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const removeUserFromWorkspace = async (userId, workspaceId, senderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(queries.removeUserFromWorkspace, [userId, workspaceId]);
    await client.query(queries.removeUserFromGeneralChat, [userId, workspaceId]);
    await client.query(queries.sendNotification, [senderId, userId, workspaceId, 1, 2]);
    await client.query('COMMIT');
    return userId;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const exitFromWorkspace = async (userId, workspaceId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(queries.removeUserFromWorkspace, [userId, workspaceId]);
    const users = await client.query(queries.getWorkspaceAdmins, [workspaceId])
    if(users.rowCount <= 0) {
      await client.query(queries.deleteWorkspace, [workspaceId]);
    }
    await client.query('COMMIT');
    return userId;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const setWorkspaceUserRole = async (userId, workspaceId, role, senderId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const isMember = (await client.query(queries.isUserWorkspaceMember, [userId, workspaceId])).rowCount === 1 ? true : false;
    if(!isMember) throw new Error();
    const _role = role == 'ADMIN' ? 1 : 2;
    await client.query(queries.setWorkspaceUserRole, [_role, userId, workspaceId]);
    await client.query(queries.sendNotification, [senderId, userId, workspaceId, 1, 3]);
    await client.query('COMMIT');
    return userId;
  } catch(e) {
    await client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const deleteWorkspace = async (workspaceId, creator) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const users = ( await client.query(queries.getUsersFromWorkspace, [workspaceId]) ).rows;
    const w = ( await client.query(queries.getWorkspace, [workspaceId]) ).rows[0]
    users.splice(users.findIndex(u => u.user_id == creator.id), 1);
    users.forEach(async u => {
      if(u.user_id != creator.id)
        await client.query(queries.sendNotification, [creator.id, u.user_id, workspaceId, 1, 4]);
    });
    await client.query(queries.deleteWorkspace, [workspaceId]);
    await client.query('COMMIT');
    return workspaceId;
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const searchWorkspace = async (search) => {
  const client = await pool.connect();
  try {
    if (search) {
      const workspaces = await client.query(queries.searchWorkspace, [`%${search}%`]);
      return workspaces.rows.map(w => ({
        id: w.workspace_id,
        name: w.workspace_name,
        description: w.workspace_description,
        repoOwner: w.workspace_repo_owner,
        repoName: w.workspace_repo_name
      }));
    }
    return [];
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const getWorkspaceById = async (id) => {
  const client = await pool.connect();
  try {
    const workspace = (await client.query(queries.getWorkspaceById, [id])).rows[0];
    return {
      id: workspace.workspace_id,
      name: workspace.workspace_name,
      description: workspace.workspace_description,
      repoOwner: workspace.workspace_repo_owner,
      repoName: workspace.workspace_repo_name,
    }
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { createWorkspace, getWorkspaces, getWorkspaceMembers,inviteUserToWorkspace, searchWorkspace,
  editWorkspace, addUserToWorkspace, removeUserFromWorkspace, exitFromWorkspace, setWorkspaceUserRole, deleteWorkspace, getWorkspaceById };