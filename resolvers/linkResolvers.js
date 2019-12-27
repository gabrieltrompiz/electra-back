/** Creates the resolvers that will delegate mutations and queries to GitHub schema */
const getResolvers = (schema) => ({
  resolvers: {
    Profile: {
      gitHubUser: {
        resolve(parent, args, context, info) {
          return context.getUser().gitHubToken ? 
          info.mergeInfo.delegateToSchema({
            schema,
            operation: 'query',
            fieldName: 'viewer',
            args: {},
            context,
            info
          }) : null;
        }
      }
    }, 
    Workspace: {
      repo: {
        resolve(parent, args, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema, 
            operation: 'query',
            fieldName: 'repo', // TODO: cambiar
            args,
            context,
            info
          })
        }
      }
    }
  }
});

module.exports = { getResolvers };