const pool = require('../utils/db');
const queries = require('../utils/queries');

/** Creates the resolvers that will delegate mutations and queries to GitHub schema */
const getResolvers = (schema) => ({
  resolvers: {
    Profile: {
      gitHubUser: {
        resolve: (parent, args, context, info) => {
          return context.getUser() ? context.getUser().gitHubToken ? 
          info.mergeInfo.delegateToSchema({
            schema,
            operation: 'query',
            fieldName: 'viewer',
            args: {},
            context,
            info
          }) : null : null;
        }
      }
    }, 
    Workspace: {
      repo: {
        resolve: async (parent, args, context, info) => {
          if(info.variableValues.workspace) {
            args = {
              name: info.variableValues.workspace.repoName,
              owner: info.variableValues.workspace.repoOwner
            };
          } else {
            const client = await pool.connect();
            const result = (await client.query(queries.getRepoData, [parent.id])).rows[0];
            args = {
              name: result.workspace_repo_name,
              owner: result.workspace_repo_owner
            };
          }
          return (args.name && args.owner) ?  info.mergeInfo.delegateToSchema({
            schema, 
            operation: 'query',
            fieldName: 'repository',
            args,
            context,
            info
          }) : null;
        }
      }
    }
  }
});

module.exports = { getResolvers };