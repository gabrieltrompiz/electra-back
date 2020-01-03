const workspaceHelper = require('../helpers/workpsace');

/** Query to get an user list of workspaces */
const getWorkspaces = async (_, __, context) => {
  try {
    return await workspaceHelper.getWorkspaces(context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not fetch workspaces.');
  }
};

/** Mutation to create a new workspace */
const createWorkspace = async (_, { workspace }, context) => {
  try {
    workspace.members.push({ id: context.getUser().id, role: 'ADMIN' });
    return await workspaceHelper.createWorkspace(workspace, context.getUser());
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create workspace.');
  }
};

/** Query to get members of a workspace */
const getWorkspaceMembers = async (parent) => {
  try {
    return await workspaceHelper.getWorkspaceMembers(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace members');
  }
};

/** Mutation to create a new active sprint */
const createSprint = async (_, { sprint }) => {
  try {
    return await workspaceHelper.createSprint(sprint);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create sprint');
  }
}

/** Mutation to send a sprint to the backlog */
const sendSprintToBacklog = async (_, { id }) => {
  try {
    return await workspaceHelper.sendSprintToBacklog(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not send sprint to backlog');
  }
}

/** Query to get active sprint of a workspace */
const getSprint = async (parent) => {
  try {
    return await workspaceHelper.getWorkspaceSprint(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace current sprint');
  }
};

/** Query to get backlog of a workspace */
const getBacklog = async (parent) => {
  try {
    return await workspaceHelper.getWorkspaceBacklog(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace backlog');
  }
};

module.exports = { getWorkspaceMembers, getWorkspaces, createWorkspace, getSprint, getBacklog, createSprint, sendSprintToBacklog };
