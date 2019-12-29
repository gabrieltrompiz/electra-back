const { AuthenticationError } = require('apollo-server');
const workspaceHelper = require('../helpers/workpsace');

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
      return await workspaceHelper.createWorkspace(workspace, context.getUser());
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
};

module.exports = { getWorkspaceMembers, getWorkspaces, createWorkspace };