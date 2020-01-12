const taskHelper = require('../helpers/task');

/** Mutation to create new Task */
const createTask = async (_, { task }, context) => {
  try {
    return await taskHelper.createTask(task, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create task');
  }
}

/** Query to get all members from a task */
const getTaskUser = async (parent) => {
  try {
    return await taskHelper.getTaskUser(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get user task');
  }
}

/** Mutation to change task status */
const updateTaskStatus = async (_, { taskId, status }, context) => {
  try {
    return await taskHelper.updateTaskStatus(taskId, status, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not update task status');
  }
}

/** Mutation to update hours spent in a Task */
const updateTaskHours = async (_, { taskId, hours }) => {
  try {
    return await taskHelper.updateTaskHours(taskId, hours);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not submit updated hours');
  }
}

/** Mutation to delete task */
const deleteTask = async (_, { id }) => {
  try {
    return await taskHelper.deleteTask(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not delete task');
  }
}

/** Query to get all tasks from a sprint */
const getTasks = async (parent) => {
  try {
    return await taskHelper.getTaskList(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get tasks');
  }
}

/** Mutation to add user to task */
const changeUserTask = async (_, { input }, context) => {
  try {
    return await taskHelper.changeUserTask(input.userId, input.taskId, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not change task user');
  }
}

const changeTaskDescription = async (_, { taskId, description }) => {
  try {
    return await taskHelper.changeTaskDescription(taskId, description);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not change task user');
  }
}

const changeTaskIssue = async (_, { taskId, issueId }) => {
  try {
    return await taskHelper.changeTaskIssue(taskId, issueId);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not change task issue');
  }
}

module.exports = { createTask, changeUserTask, getTasks, getTaskUser, updateTaskHours,
  updateTaskStatus, changeTaskDescription, changeTaskIssue, deleteTask };