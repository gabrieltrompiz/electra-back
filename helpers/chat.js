const pool = require('../utils/db');
const queries = require('../utils/queries');

const getWorkspaceChats = async (workspaceId, userId) => {
  const client = await pool.connect();
  try {
    const chats = await client.query(queries.getWorkspaceChats, [userId, workspaceId]);
    return chats.rows.map((c) => ({
      id: c.chat_id,
      type: c.type_chat_id == 1 ? 'DIRECT' : 'CHANNEL',
      name: c.chat_name,
      description: c.chat_description
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getChatUsers = async id => {
  const client = await pool.connect();
  try {
    const users = await client.query(queries.getChatUsers, [id]);
    return users.rows.map((u) => ({
      id: u.user_id,
      username: u.user_username,
      fullName: u.user_fullname,
      email: u.user_email,
      pictureUrl: u.user_picture_url
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { getWorkspaceChats, getChatUsers };