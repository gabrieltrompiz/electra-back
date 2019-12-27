const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const userHelper = require('../helpers/user');
const fetch = require('node-fetch');
/** Query that returns the logged in profile */
const getProfile = async (_, __, context) => {
  const user = context.getUser();
  if(user) {
    return user;
  } else {
    return new AuthenticationError('Not logged in.')
  }
};

/** Mutation that registers a new user and returns it to the user */
const register = async (_, args, context) => {
  const { user } = args;
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
    .catch(() => { throw new AuthenticationError('Invalid GitHub credentials.') })
  if(!response.access_token) throw new AuthenticationError('Invalid token or expired.')
  return { code: response.access_token };
};

const getUserByEmail = async (_, { email }) => {
  return { exists: await userHelper.checkEmail(email) }
};

const getUserByUsername = async (_, { username }) => {
  return { exists: await userHelper.checkUsername(username) }
};

/** Object with all the resolvers, including queries and mutations */
const resolvers = {
  Query: {
    profile: getProfile,
    emailExists: getUserByEmail,
    usernameExists: getUserByUsername
  },
  Mutation: {
    register,
    login,
    generateGitHubToken
  }
};

module.exports = { resolvers };