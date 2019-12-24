const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const queries = require('../utils/queries');
const fetch = require('node-fetch');

const getProfile = async (parent, args, context, info) => {
  const user = context.getUser();
  if(user) {
    return user;
  } else {
    return new AuthenticationError('Not logged in.')
  }
};

const register = async (parent, args, context, info) => {
  const { pool } = context;
  const client = await pool.connect();
  const { user } = args;
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
  try { // TODO: Check repeated email and username
    const res = (await client.query(queries.registerUser, [user.fullName, user.username, user.email, user.gitHubToken, user.password, user.pictureUrl])).rows[0];
    const _user = {
      id: res.user_id,
      username: res.user_username,
      fullName: res.user_fullname,
      email: res.user_email,
      gitHubToken: res.user_github_token,
      pictureUrl: res.user_picture_url
    }
    context.login(_user);
    return _user;
  } catch(e) {
    console.error(e.stack);
    throw Error('Could not register user.');
  } finally {
    client.release();
  }
};

const login = async (parent, args, context, info) => {
  const { username, password } = args.user;
  const { user } = await context.authenticate('graphql-local', { username, password });
  if(!user) {
    throw new AuthenticationError('Bad Credentials');
  } else {
    context.login(user);
    return { ...user, password: undefined };
  }
};

const generateGitHubToken = async (parent, { code }) => {
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
    .catch(err => { throw new AuthenticationError('Invalid GitHub credentials.') })
  if(!response.access_token) throw new AuthenticationError('Invalid token or expired.')
  return { code: response.access_token };
};

const resolvers = {
  Query: {
    profile: getProfile,
  },
  Mutation: {
    register,
    login,
    generateGitHubToken
  }
};

module.exports = { resolvers };