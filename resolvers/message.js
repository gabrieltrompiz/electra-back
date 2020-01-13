const messageHelper = require('../helpers/message');

const getChatMessages = async (parent) => {
  try {
    console.log(parent);
    return await chatHelper.getChatMessages(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get chat messages');
  }
}

module.exports = { getChatMessages };