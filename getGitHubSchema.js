const { introspectSchema, makeRemoteExecutableSchema } = require('graphql-tools-fork');
const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

module.exports.getGitHubSchema = async (authorization, endpoint) => {
  const http = new HttpLink({ uri: endpoint, fetch });
  const link = setContext(() => ({
    headers: {
      authorization: `Bearer ${authorization}`,
    },
  })).concat(http);
  const schema = await introspectSchema(link);
  return makeRemoteExecutableSchema({
    schema,
    link
  })
}