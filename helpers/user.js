const pool = require('../utils/db');
const queries = require('../utils/queries');
const bcrypt = require('bcryptjs');

/** Connects with database and fetch a whole user by their username.
 * @async
 * @function getUserByUsername
 * @param {string} username - Username of the user
 * @return {Promise} user - User retrieved from the db
 */
const getUserByUsername = async username => {
  const client = await pool.connect();
  const res = await client.query(queries.getUserByUsername, [username]);
  if(res.rowCount === 0) return null;
  else return ({
    id: res.rows[0].user_id,
    fullName: res.rows[0].user_fullname,
    username: res.rows[0].user_username,
    email: res.rows[0].user_email,
    gitHubToken: res.rows[0].user_github_token,
    password: res.rows[0].user_password,
    pictureUrl: res.rows[0].user_picture_url
  })
};

/** Compares an unhashed candidate password and a hashed password to check if they match 
 * @function comparePassword
 * @param {string} candidate - Unhashed password
 * @param {string} hash - Hashed password
 * @returns {boolean} isMatch - If the passwords match or not
 */
const comparePassword = (candidate, hash) => {
  return new Promise((res, rej) => {
    bcrypt.compare(candidate, hash, (err, isMatch) => {
      if(err) rej(err);
        res(isMatch);
    });
  });
};

module.exports = { getUserByUsername, comparePassword };