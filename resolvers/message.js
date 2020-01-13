const messageHelper = require('../helpers/message');

const getChatMessages = async (parent) => {
  try {
    return await messageHelper.getMessages(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get chat messages');
  }
}

const getMessageUser = async (parent) => {
  try {
    return await messageHelper.getMessageUser(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get user message');
  }
}

module.exports = { getChatMessages, getMessageUser };