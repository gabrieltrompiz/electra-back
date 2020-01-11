const subtaskHelper = require('../helpers/subtask');

const getSubtasks = async (parent) => {
  try {
    console.log(parent);
    return await subtaskHelper.getSubtasks(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get subtasks');
  }
}

module.exports = { getSubtasks };
