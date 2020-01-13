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

const createMessage = async (_, { message }, parent) => {
  try {
    return await messageHelper.createMessage(message, parent.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not send message');
  }
}

const deleteMessage = async (_, { messageId }) => {
  try {
    return await messageHelper.deleteMessage(messageId);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not delete message');
  }
}

module.exports = { getChatMessages, getMessageUser, createMessage, deleteMessage };