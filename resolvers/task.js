const taskHelper = require('../helpers/task');

/** Mutation to create new Task */
const createTask = async (_, { task }) => {
  try {
    return await taskHelper.createTask(task);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create task');
  }
}

/** Query to get all members from a task */
const getTaskMembers = async (parent) => {
  try {
    return await taskHelper.getTaskMembers(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not add members to task');
  }
}

/** Mutation to change task status */
const updateTaskStatus = async (_, { id }) => {
  try {
    return await taskHelper.updateTaskStatus(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not update task status');
  }
}

/** Mutation to update hours spent in a Task */
const updateTaskHours = async (_, { id, hours }) => {
  try {
    return await taskHelper.updateTaskHours(id, hours);
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

/** Query to get all tasks from a workspace */
const getTasks = async (parent) => {
  try {
    return await taskHelper.getTasks(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get tasks');
  }
}

/** Mutation to add user to task */
const addUserTask = async (_, { id }) => {
  try {
    return await taskHelper.addUserTask(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not add user');
  }
}

/** Mutation to remove user from task */
const removeUserTask = async (_, { id }) => {
  try {
    return await taskHelper.removeUserTask(id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not remove user');
  }
}

module.exports = { createTask, addUserTask, removeUserTask, getTasks, getTaskMembers, updateTaskHours, updateTaskStatus, deleteTask }