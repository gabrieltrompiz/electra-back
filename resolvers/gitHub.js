const pool = require('../utils/db');
const queries = require('../utils/queries');
const FragmentWraper = require('../utils/FragmentWraper');

/** Creates the resolvers that will delegate mutations and queries to GitHub schema */
const getResolvers = (schema) => ({
  resolvers: {
    Profile: {
      gitHubUser: {
        resolve: (parent, args, context, info) => {
          return context.isAuthenticated() ? context.getUser().gitHubToken ? 
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
            try {
              const result = (await client.query(queries.getRepoData, [parent.id])).rows[0];
              args = {
                name: result.workspace_repo_name,
                owner: result.workspace_repo_owner
              };
            } catch(e) {} finally { client.release(); }
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
    },
    Task: {
      issue: {
        resolve: async (parent, args, context, info) => {
          const id = "MDU6SXNzdWUxNDkyMzk2OA==";
          // TODO: change to id from db
          return info.mergeInfo.delegateToSchema({
            schema,
            operation: 'query',
            fieldName: 'node',
            args: { id },
            context,
            info,
            transforms: [
              new FragmentWraper(schema, 'Node', 'Issue')
            ]
          })
        }
      }
    }
  }
});

module.exports = { getResolvers };