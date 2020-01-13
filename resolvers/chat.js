const chatHelper = require('../helpers/chat');

const getWorkspaceChats = async (parent) => {
  try {
    console.log(parent);
    return await chatHelper.getWorkspaceChats(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get chats');
  }
}

module.exports = { getWorkspaceChats };