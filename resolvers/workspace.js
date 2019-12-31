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

const createSprint = async (_, { sprint }) => {
  try {
    return await workspaceHelper.createSprint(sprint);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create sprint');
  }
}
const sendSprintToBacklog = async (_, { id }) => {
  try {
    return await workspaceHelper.sendSprintToBacklog(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not send sprint to backlog');
  }
}

const getSprint = async (parent) => {
  try {
    return await workspaceHelper.getWorkspaceSprint(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace current sprint');
  }
};

const getBacklog = async (parent) => {
  try {
    return await workspaceHelper.getWorkspaceBacklog(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace backlog');
  }
};

module.exports = { getWorkspaceMembers, getWorkspaces, createWorkspace, getSprint, getBacklog, createSprint, sendSprintToBacklog };
