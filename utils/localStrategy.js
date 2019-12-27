const userHelper = require('../helpers/user');
const { GraphQLLocalStrategy } = require('graphql-passport');

/** Strategy to login users using username and password 
 * @param {string} username - Username or email given by the user
 * @param {string} password - Unhashed password given by the user
*/
module.exports = new GraphQLLocalStrategy((username, password, done) => {
  userHelper.getUserByUsername(username).then(user => {
    if(!user) return done(null, false);
    userHelper.comparePassword(password, user.password).then(isMatch => {
      if(isMatch) return done(null, user);
      else return done(null,false)
    })
  }, e => {
    return done(null, false)
  })
});