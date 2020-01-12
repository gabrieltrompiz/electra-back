const pool = require('../utils/db');
const queries = require('../utils/queries');
const bcrypt = require('bcryptjs');

/** Connects with database and fetch a whole user by their username.
 * @async
 * @function getUserByUsername
 * @param {string} username - Username of the user
 * @returns {Promise} user - User retrieved from the db
 */
const getUserByUsername = async username => {
  const client = await pool.connect();
  const res = await client.query(queries.getUserByUsername, [username])
  .finally(() => client.release());
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

/** Checks if an user already exists with the given username
 * @async
 * @function checkUsername
 * @param {string} username - Username to be checked
 * @return {boolean} exists - True if the user exists, false if not.
 */
const checkUsername = async username => {
  const client = await pool.connect();
  const res = await client.query(queries.getUserByUsername, [username])
  .finally(() => client.release());
  return res.rowCount > 0;
};

/** Checks if an user already exists with the given email
 * @async
 * @function checkEmail
 * @param {string} email - Email to be checked
 * @return {boolean} exists - True if the user exists, false if not.
 */
const checkEmail = async email => {
  const client = await pool.connect();
  const res = await client.query(queries.getUserByEmail, [email])
  .finally(() => client.release());
  return res.rowCount > 0;
};

/** Registers a new user in the database
 * @async
 * @function register
 * @param {Object} user - Contains all the data needed to register user
 * @returns {Promise} user - User created in the database
 */
const register = async user => {
  const client = await pool.connect();
  try {
    const res = (await client.query(queries.registerUser, 
      [user.fullName, user.username, user.email, user.gitHubToken ? user.gitHubToken : null, user.password, user.pictureUrl])).rows[0];
    const _user = {
      id: res.user_id,
      username: res.user_username,
      fullName: res.user_fullname,
      email: res.user_email,
      gitHubToken: res.user_github_token,
      pictureUrl: res.user_picture_url
    };
    return { _user };
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
};

/** Searchs an user by their username, email or full name
 * @async
 * @function search
 * @param {string} param - parameter that will be used to search coincidences
 * @returns {Promise<Array<object>>} users that matches the param
 */
const search = async (param, id) => {
  const client = await pool.connect();
  try {
    const _users = await client.query(queries.searchUsers, [`%${param}%`, id]);
    return _users.rows.map((u) => ({
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

/** Edits user profile with specified values and return modified profile
 * @function comparePassword
 * @param {Object} profile - User data
 * @returns {Promise} Profile
 */
const editProfile = async ({ fullName, username, email, gitHubToken, pictureUrl }, context) => {
  const client = await pool.connect();
  try {
    await client.query(queries.editProfile, [fullName, username, email, gitHubToken ? gitHubToken : null, pictureUrl, context.getUser().id]);
    
    context.login({
      ...context.getUser(),
      fullName,
      username,
      email,
      gitHubToken,
      pictureUrl
    });

    return {
      ...context.getUser(),
      password: undefined
    };
  } catch(e) {
    throw Error(e);
  } finally {
    client.release();
  }
}

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

module.exports = { getUserByUsername, comparePassword, register, checkEmail, checkUsername, search, editProfile };