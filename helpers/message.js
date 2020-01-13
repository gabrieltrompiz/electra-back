const pool = require('../utils/db');
const queries = require('../utils/queries');

const getMessages = async id => {
  const client = await pool.connect();
  try {
    const messages = await client.query(queries.getChatMessages, [id]);
    return messages.rows.map((m) => ({
      id: m.message_id,
      type: m.type_message_id,
      content: m.message_content,
      date: m.message_date
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const getMessageUser = async id => {
  const client = await pool.connect();
  try {
    const u = (await client.query(queries.getMessageUser, [id])).rows[0];
    
    return {
      id: u.user_id,
      fullName: u.user_fullname,
      username: u.user_username,
      email: u.user_email,
      pictureUrl: u.user_picture_url
    };
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { getMessages, getMessageUser };