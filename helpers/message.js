const pool = require('../utils/db');
const queries = require('../utils/queries');

const getMessages = async id => {
  const client = await pool.connect();
  try {
    const messages = await client.query(queries.getComments, [id]);
    return messages.rows.map((m) => ({
      id: m.message.id,
      user: {
        id: user_id
      },
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

module.exports = { getMessages };