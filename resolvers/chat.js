const chatHelper = require('../helpers/chat');

const getWorkspaceChats = async (parent, _, context) => {
  try {
    return await chatHelper.getWorkspaceChats(parent.id, context.getUser().id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get chats');
  }
}

module.exports = { getWorkspaceChats };