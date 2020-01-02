const { AuthenticationError } = require('apollo-server');
const { Observable, of } = require('rxjs');
const { map } = require('rxjs/operators');

/** Checks wether the user is authenticated or not
 * @function isAuthenticated
 * @param {Array} args - Args that are usually sent to the resolvers
 */
const isAuthenticated = (parent, args, context, info) => {
  if(!context.isAuthenticated()) {
    throw new AuthenticationError('Not logged in.');
  }
};

/** Chains all functions one by one so the middlewares get applied one by one
 * @async
 * @function use
 * @param {Array} args - Arguments that GraphQL sends to resolvers
 * @param {Array} functions - Middlewares that will be applied before the resolver
 * @param {Function} resolver - Resolver that will be called after middlewares
 * @returns {Promise} result - A promise that resolves to the value returned by the resolver 
 */
const applyMiddleware = (...middlewares) => (resolver) => async (parent, args, context, info) => {
  try {
    await Promise.all(middlewares.map(async (fn) => 
      fn(parent, args, context, info)
    ));
    return await resolver(parent, args, context, info);
  } catch(e) {
    return e;
  }
};

module.exports = { isAuthenticated, applyMiddleware };