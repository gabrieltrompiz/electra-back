const pool = require('../utils/db');
const queries = require('../utils/queries');

const getWorkspaceChats = async id => {
  const client = await pool.connect();
  try {
    const chats = await client.query(queries.getWorkspaceChats, [id]);
    return chats.rows.map((c) => ({
      id: c.message_id,
      type: c.type_chat_id == 1 ? 'DIRECT' : 'CHANNEL',
      name: c.message_name,
      description: c.message_description
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { getWorkspaceChats };