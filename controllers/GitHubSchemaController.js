const { introspectSchema, makeRemoteExecutableSchema, makeExecutableSchema } = require('graphql-tools-fork');
const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');
const { Subject } = require('rxjs');
const { GraphQLSchema } = require('graphql');
const { ApolloLink } = require('apollo-link-http');

/** Class to manage the GitHub schema, it loads the local version of GitHub schema so stitching can be done if authorization token is not provided.
 * If it's provided it will use the actual GitHub schema from the url provided (actually it is https://api.github.com/graphql)
 * @author Gabriel Trompiz (https://github.com/gabrieltrompiz)
 * @author Luis Petrella (https://github.com/Ptthappy)
 * @see See https://developer.github.com/v4/
 */
class GitHubSchemaController {
  /** Create a controller
   * @constructor 
   * @param {string} endpoint - The url that will be used to fetch GitHub schema
   * @param {Subject} subject - rxjs Subject that will notify controller to update schema based on tokens
   */
  constructor(endpoint, subject) {
    /** Indicates if the schema have the resolvers loaded or not.
     * @type {boolean} */
    this.haveResolvers = false;

    /** Contains the ApolloLink that connects with the GitHub schema with the HttpLink 
     * @type {ApolloLink} */
    this.link = null;

    /** HttpLink that will be used by ApolloLink
     * @type {HttpLink} */
    this.http = null;

    /** GitHub schema created
     * @type {GraphQLSchema} */
    this.schema = null;

    /** Endpoint that will be used to instrospect schema
     * @type {string} */
    this.endpoint = endpoint;

    /** rxjs Subject to indicate the controller to update schema
     * @type {Subject} */
    this.subject = subject;

    /** Authorization token to use GitHub API
     * @type {string} */
    this.token = null;

    /** Local cached schema from Github to avoid loading it multiple times when not needed
     * @type {GraphQLSchema} */
    this.cachedSchema = null;
  }

  /** Method to create the GitHub schema based on the token given, if any.
   * Uses apollo-link to create a connection to the schema and perform introspection against it.
   * @async
   * @function createGHSchema
   * @returns {Promise<GraphQLSchema>} Promise resolved with GitHub schema based on token
   */
  createGHSchema = async () => {
    this.http = new HttpLink({ uri: this.endpoint, fetch });
    this.link = setContext((request, prevContext) => {
      if(this.haveResolvers && prevContext.graphqlContext) {
        this.token = this.token !== prevContext.graphqlContext.getUser().gitHubToken ? prevContext.graphqlContext.getUser().gitHubToken : this.token;
      }
      if(!this.haveResolvers && prevContext.graphqlContext && prevContext.graphqlContext.getUser().gitHubToken) {
        this.haveResolvers = true;
        this.token = prevContext.graphqlContext.getUser().gitHubToken;
        this.subject.next();
      }
      return prevContext.graphqlContext ? 
      ({ headers: { 'Authorization': `Bearer ${this.token}` } }) : 
      ({ headers: {} })
    }).concat(this.http);
    try {
      this.schema = await introspectSchema(this.link);
    } catch {
      if(!this.cachedSchema) {
        this.schema = makeExecutableSchema({ typeDefs: require('../schemas/github.schema').typeDefs, resolverValidationOptions: { requireResolversForResolveType: false } });
        this.cachedSchema = this.schema;
      } else {
        this.schema = this.cachedSchema;
      }
    }
    return makeRemoteExecutableSchema({
      schema: this.schema,
      link: this.link
    })
  }
};

module.exports = { controller: GitHubSchemaController };