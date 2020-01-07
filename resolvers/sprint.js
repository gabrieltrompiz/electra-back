const sprintHelper = require('../helpers/sprint');

/** Mutation to create a new active sprint */
const createSprint = async (_, { sprint }) => {
  try {
    return await sprintHelper.createSprint(sprint);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create sprint');
  }
}

/** Mutation to send a sprint to the backlog */
const sendSprintToBacklog = async (_, { id }) => {
  try {
    return await sprintHelper.sendSprintToBacklog(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not send sprint to backlog');
  }
}

/** Query to get active sprint of a workspace */
const getSprint = async (parent) => {
  try {
    return await sprintHelper.getWorkspaceSprint(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace current sprint');
  }
};

/** Query to get backlog of a workspace */
const getBacklog = async (parent) => {
  try {
    return await sprintHelper.getWorkspaceBacklog(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error ('Could not get workspace backlog');
  }
};

module.exports = { createSprint, sendSprintToBacklog, getSprint, getBacklog}