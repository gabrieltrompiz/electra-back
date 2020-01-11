const subtaskHelper = require('../helpers/subtask');

const getSubtasks = async (parent) => {
  try {
    return await subtaskHelper.getSubtasks(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get subtasks');
  }
}

const createSubtask = async (_, { subTask }) => {
  try {
    return await subtaskHelper.createSubtask(subTask);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create subtask');
  }
}

const editSubtask = async (_, { description, subTaskId }) => {
  try {
    return await subtaskHelper.editSubtask(description, subTaskId);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not edit subtask');
  }
}

const setStatus = async (_, { status, subTaskId }) => {
  try {
    return await subtaskHelper.setStatus(status, subTaskId);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not edit subtask status');
  }
}

const deleteSubtask = async (_, { subTaskId }) => {
  try {
    return await subtaskHelper.deleteSubtask(subTaskId);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not delete subtask');
  }
}

module.exports = { getSubtasks, createSubtask, editSubtask, setStatus, deleteSubtask };
