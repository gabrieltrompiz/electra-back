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
  }

  createGHchema = async () => {
    console.log('Fetching initial GH schema without resolvers.');
    this.http = new HttpLink({ uri: this.endpoint, fetch });
    this.link = setContext((request, prevContext) => {
      if(this.haveResolvers && prevContext.graphqlContext) {
        this.token = this.token !== prevContext.graphqlContext.headers.authorization ? prevContext.graphqlContext.headers.authorization : this.token;
      }
      if(!this.haveResolvers && prevContext.graphqlContext && prevContext.graphqlContext.headers.authorization) {
        this.haveResolvers = true;
        this.token = prevContext.graphqlContext.headers.authorization;
        this.subject.next(true);
      }
      return prevContext.graphqlContext ?
      ({
          headers: {
            'Authorization': this.token,
          },
        }) : 
        ({ headers: {} })
    }).concat(this.http);
    if(!this.schema) {
      try {
        this.schema = await introspectSchema(this.link);
      } catch {
        console.log('Unauthorized to use GitHub API.');
        this.schema = makeExecutableSchema({ typeDefs: require('../schemas/github.schema').typeDefs, resolverValidationOptions: { requireResolversForResolveType: false } })
      }
    }
    return makeRemoteExecutableSchema({
      schema: this.schema,
      link: this.link
    })
  }

  updateGHSchema = async () => {
    console.log('Updating GitHub schema with token: ' + this.token);
    const newLink = setContext(() => ({
      headers: {
        'Authorization': this.token
      }
    })).concat(this.http)
    this.schema = await introspectSchema(newLink);
    return makeRemoteExecutableSchema({
      schema: this.schema,
      link: newLink
    })
  }
}