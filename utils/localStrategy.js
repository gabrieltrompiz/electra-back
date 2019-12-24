const userHelper = require('../helpers/user');
const { GraphQLLocalStrategy } = require('graphql-passport');

/** Strategy to login users using username and password */
module.exports = new GraphQLLocalStrategy((username, password, done) => {
  userHelper.getUserByUsername(username).then(user => {
    if(!user) done(null, false);
    userHelper.comparePassword(password, user.password).then(isMatch => {
      if(isMatch) done(null, user);
      else done(null,false)
    })
  }, e => {
    done(null, false)
  })
});