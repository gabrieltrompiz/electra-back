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

/** Mutation to invite new users to the indicated workspace */
const inviteUserToWorkspace = async (_, { users, workspace }, context) => {
  try {
    return await workspaceHelper.inviteUserToWorkspace(users, workspace, context.getUser().fullName);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not send Invitation to selected Users');
  }
}

const editWorkspace = async (_, { workspace }) => {
  try {
    return await workspaceHelper.editWorkspace(workspace);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not edit Workspace');
  }
}

const addUserToWorkspace = async (_, { input }) => {
  try {
    return await workspaceHelper.addUserToWorkspace(input.userId, input.workspaceId, input.role);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not add user to Workspace');
  }
}

module.exports = { getWorkspaceMembers, getWorkspaces, createWorkspace, inviteUserToWorkspace, editWorkspace, addUserToWorkspace };