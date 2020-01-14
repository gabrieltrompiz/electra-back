const chatHelper = require('../helpers/chat');

const getWorkspaceChats = async (parent, _, context) => {
  try {
    return await chatHelper.getWorkspaceChats(parent.id, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get chats');
  }
}

const getChatUsers = async (parent) => {
  try {
    return await chatHelper.getChatUsers(parent.id);
  } catch(e) {
    console.log(e);
    throw Error('Could not get chat users');
  }
}

module.exports = { getWorkspaceChats, getChatUsers };