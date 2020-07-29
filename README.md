<br />
<p align='center'>
  Back-End of Desktop Application for the Synchronization of Collaborators in a Software Development Project
  <br />
  <img src='https://raw.githubusercontent.com/gabrieltrompiz/electra-front/develop/screenshots/power-with-name.png' alt='logo' />
</p>

## Table of Contents
* [About this project](#about-this-project)
* [Tech Stack](#teck-stack)
* [Features](#features)
* [Controllers and Helpers](#controllers-and-helpers)
* [Avaliable Scripts](#available-scripts)

## About this project
This project was developed for opting for a Bachelor's Degree in Computer Science in Rafael Urdaneta University. It's a tool to keep collaborators on a project synchronized, with some GitHub features like repositories which can be linked to workpsaces, issues that can be linked to tasks, and so on... It was inspired in Discord's UI and in functionality it's like a basic Trello with GitHub features.

## Tech Stack
* Node.js
* Express
* Apollo Server
* Database in PostgreSQL

## Features
The main features of the application are:
* Users may register and link their GitHub profile to their account, to be able to get access to repositories, issues, pull requests and so on... Workspaces have a basic to-do, in progress and done board. There are two types of users on workspaces: admins and members.
* Workspaces can be created, these workspaces are like a board, and can have a repository associated. Having a repository linked to a workspace gives users the ability to assign issues on their repo to specific tasks.
* Tasks, as mentioned above, can have an issue associated, an user assigned to get this task done, due date, comments, checklists and can be moved between boards.
* Each workspace can have any number of sprints, with a start date and finish date, and they move to a sprint backlog when completed.
* Workspaces have channels (like groups) and one-on-one chats between members. This specific feature was inspired by Slack.

## Controllers and Helpers
### GitHubSchemaController
Class to manage the GitHub schema, it loads the local version of GitHub schema so stitching can be done if authorization token is not provided.
If it's provided it will use the actual GitHub schema from the url provided (actually it is https://api.github.com/graphql)
The constructor receives and endpoint to be called to instrospect remote schema, and a RxJS Subject that will notify controller to update schema when a token is refreshed.

### applyMiddleware
Chains all functions one by one so the middlewares get applied one by one, and then, calls the resolver.
It's a Express-like middleware applying function, what will call any number of middlewares sequentially until it reaches the resolver.
This was used to enforce some conditions in many resolvers without the need to validate such thing separately in each resolver.

```javascript
  const applyMiddleware = (...middlewares) => (resolver) => async (parent, args, context, info) => {
    try {
      const result = await Promise.mapSeries([...middlewares, resolver], (fn) => fn(parent, args, context, info));
      return result[result.length - 1];
    } catch(e) {
      return e;
    }
  };
```
Bluebird's Promise was used to easily apply middlewares sequentially.

### FragmentWrapper
This was a class created to modify a request transformations in a schema delegation query. This was used to modify a query to the field `node` of GitHub's schema, so we were able to include an inline fragment in the request, since `node` is an union of multiple types in GitHub's schema.

```javascript
class FragmentWrapper {
  constructor(targetSchema, parentType, targetType) {
    this.targetSchema = targetSchema;
    this.parentType = parentType;
    this.targetType = targetType;
  }

  transformRequest(originalRequest) {
    const typeInfo = new TypeInfo(this.targetSchema);
    const document = visit(
      originalRequest.document,
      visitWithTypeInfo(typeInfo, {
        [Kind.SELECTION_SET]: (
          node,
        ) => {
          const parentType = typeInfo.getParentType();
          let selections = node.selections;

          if (parentType && parentType.name === this.parentType) {
            const fragment = parse(
              `fragment ${this.targetType}Fragment on ${
                this.targetType
              } ${print(node)}`,
            );
            let inlineFragment;
            for (const definition of fragment.definitions) {
              if (definition.kind === Kind.FRAGMENT_DEFINITION) {
                inlineFragment = {
                  kind: Kind.INLINE_FRAGMENT,
                  typeCondition: definition.typeCondition,
                  selectionSet: definition.selectionSet,
                };
              }
            }
            selections = selections.concat(inlineFragment);
          }

          if (selections !== node.selections) {
            return {
              ...node,
              selections,
            };
          }
        },
      }),
    );
    return { ...originalRequest, document };
  }
}
```

## To-do
These are features that couldn't be completed, but we would love to pick them up in a near future:
* Adding pull requests to a workspace
* Being able to see the tree of the repository with all of its branches
* Implement sockets, nothing is in real-time at the moment

## Available Scripts
In the project directory you can run:

### `npm start` or `yarn start`
Launches the server with GraphiQL and instrospection enabled.

### `npm run dev` or `yarn run dev`
Launches the server with GraphiQL and introspection enabled, in development mode. It will restart anytime changes are made.

## Credits
This project was developed by Gabriel Trompiz: [@gabrieltrompiz](https://github.com/gabrieltrompiz) and Luis Petrella [@ptthappy](https://github.com/ptthappy).
