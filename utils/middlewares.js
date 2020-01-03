const { AuthenticationError } = require('apollo-server');
const Promise = require("bluebird");

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
 * @param {Array} middlewares - Middlewares that will be applied before the resolver
 * @param {Function} resolver - Resolver that will be called after middlewares
 * @param args - Args that are passed to the resolver
 * @returns {(resolver) => (...args) => Promise} result - A promise that resolves to the value returned by the resolver 
 */
const applyMiddleware = (...middlewares) => (resolver) => async (parent, args, context, info) => {
  middlewares.push(resolver);
  try {
    const result = await Promise.mapSeries(middlewares, (fn) => fn(parent, args, context, info));
    return result[result.length - 1];
  } catch(e) {
    return e;
  }
};

module.exports = { isAuthenticated, applyMiddleware };