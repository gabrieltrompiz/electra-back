const { AuthenticationError } = require('apollo-server');
const userHelper = require('../helpers/user');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

/** Query that returns the logged in profile */
const getProfile = async (_, __, context) => {
  if(context.isAuthenticated()) {
    return context.getUser();
  } else {
    return new AuthenticationError('Not logged in.')
  }
};

/** Mutation that registers a new user and returns it to the user */
const register = async (_, { user }, context) => {
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
  try { 
    const { _user } = await userHelper.register(user);
    context.login(_user);
    return _user;
  } catch(e) {
    console.error(e.stack);
    throw Error('Could not register user.');
  }
};

/** Mutation that authenticates a user */
const login = async (_, args, context) => {
  const { username, password } = args.user;
  const { user } = await context.authenticate('graphql-local', { username, password });
  if(!user) {
    throw new AuthenticationError('Bad Credentials');
  } else {
    context.login(user);
    return { ...user, password: undefined };
  }
};

/** Mutation that logouts user */
const logout = async (_, __, context) => {
  context.logout();
  return null;
};

/** Mutation to generate authentication token from GitHub using code sent by client */
const generateGitHubToken = async (_, { code }) => {
  const credentials = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code
  };
  const response = await fetch(`https://github.com/login/oauth/access_token`,
    { method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(credentials)
    }).then(res => res.json())
    .catch(() => { throw new AuthenticationError('Invalid GitHub credentials.') });
  if(!response.access_token) throw new AuthenticationError('Invalid token or expired.');
  return { code: response.access_token };
};

/** Returns wether an user with the email given exists or not */
const getUserByEmail = async (_, { email }) => {
  return { exists: await userHelper.checkEmail(email) };
};

/** Returns wether an user with the username given exists or not */
const getUserByUsername = async (_, { username }) => {
  return { exists: await userHelper.checkUsername(username) };
};

module.exports = { getProfile, register, login, generateGitHubToken, getUserByEmail, getUserByUsername , logout };