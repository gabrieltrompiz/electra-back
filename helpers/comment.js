const pool = require('../utils/db');
const queries = require('../utils/queries');

const getComments = async id => {
  const client = await pool.connect();
  try {
    const comments = await client.query(queries.getComments, [id]);
    return comments.rows.map((c) => ({
      id: c.comment_id,
      user: {
        id: c.user_id,
        username: c.user_username,
        fullName: c.user_fullname,
        email: c.user_email,
        pictureUrl: c.user_picture_url
      },
      description: c.comment_description
    }));
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const createComment = async ({ taskId, description }, creator) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const c = (await client.query(queries.createComment, [taskId, creator.id, description])).rows[0];
    const resUser = (await client.query(queries.getUserFromTask, [taskId]))

    if(resUser.rowCount > 0) {
      if(creator.id != resUser.rows[0].user_id) await client.query(queries.sendNotification, [creator.id, resUser.rows[0].user_id, taskId, 3, 10]);
    }

    await client.query('COMMIT');
    return {
      id: c.comment_id,
      user: {
        id: creator.id,
        username: creator.username,
        fullName: creator.fullName,
        email: creator.email,
        pictureUrl: creator.pictureUrl
      },
      description
    }
  } catch(e) {
    client.query('ROLLBACK');
    throw Error(e);
  } finally {
    client.release();
  }
};

const editComment = async (id, description, user) => {
  const client = await pool.connect();
  try {
    const c = (await client.query(queries.editComment, [description, id])).rows[0];
    return {
      id: c.comment_id,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        pictureUrl: user.pictureUrl
      },
      description: c.comment_description
    };
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

const deleteComment = async id => {
  const client = await pool.connect();
  try {
    await client.query(queries.deleteComment, [id]);
    return id;
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

module.exports = { getComments, createComment, editComment, deleteComment };