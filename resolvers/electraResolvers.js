const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const userHelper = require('../helpers/user');
const workspaceHelper = require('../helpers/workpsace');
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

/** Query to get an user list of workspaces */
const getWorkspaces = async (_, __, context) => {
  if(context.getUser()) {
    try {
      return await workspaceHelper.getWorkspaces(context.getUser().id);
    } catch(e) {
      console.log(e.stack);
      throw Error('Could not fetch workspaces.');
    }
  } else {
    return new AuthenticationError('Not logged in.')
  }
};

const createWorkspace = async (_, { workspace }, context) => {
  if(context.getUser()) {
    try {
      workspace.members.push({ id: context.getUser().id, role: 'ADMIN' });
      return await workspaceHelper.createWorkspace(workspace);
    } catch(e) {
      console.log(e.stack);
      throw Error('Could not create workspace.');
    }
  } else {
    return new AuthenticationError('Not logged in.');
  }
};

const getWorkspaceMembers = async (parent) => {
  try {
    return await workspaceHelper.getWorkspaceMembers(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace members');
  }
}

/** Returns wether an user with the email given exists or not */
const getUserByEmail = async (_, { email }) => {
  return { exists: await userHelper.checkEmail(email) };
};

/** Returns wether an user with the username given exists or not */
const getUserByUsername = async (_, { username }) => {
  return { exists: await userHelper.checkUsername(username) };
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
    generateGitHubToken,
    createWorkspace
  },
  Profile: {
    workspaces: getWorkspaces
  },
  Workspace: {
    members: getWorkspaceMembers
  }
};

module.exports = { resolvers };