const commentHelper = require('../helpers/comment');

const getComments = async (parent) => {
  try {
    return await commentHelper.getComments(parent.id);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not get comments');
  }
}

const createComment = async (_, { comment }, context) => {
  try {
    return await commentHelper.createComment(comment, context.getUser());
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not create comment');
  }
}

const editComment = async (_, { commentId, description }, context) => {
  try {
    return await commentHelper.editComment(commentId, description, context.getUser());
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not edit comment');
  }
}

const deleteComment = async (_, { commentId }) => {
  try {
    return await commentHelper.deleteComment(commentId);
  } catch(e) {
    console.log(e.stack);
    throw Error('Could not delete comment');
  }
}

module.exports = { getComments, createComment, editComment, deleteComment };