const { introspectSchema, makeRemoteExecutableSchema, makeExecutableSchema } = require('graphql-tools-fork');
const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

module.exports = class GitHubSchemaController {
  constructor(endpoint, subject) {
    this.haveResolvers = false;
    this.link = null;
    this.http = null;
    this.schema = null;
    this.endpoint = endpoint;
    this.subject = subject;
    this.token = null;
    this.cachedSchema = null;
  }

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
}