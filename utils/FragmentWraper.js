const {
  TypeInfo,
  visit,
  visitWithTypeInfo,
  parse,
  print,
  Kind,
} = require('graphql');

module.exports = class FragmentWraper {
  constructor(
    targetSchema,
    parentType,
    targetType,
  ) {
    this.targetSchema = targetSchema;
    this.parentType = parentType;
    this.targetType = targetType;
  }

  transformRequest(originalRequest) {
    const typeInfo = new TypeInfo(this.targetSchema);
    const document = visit(
      originalRequest.document,
      visitWithTypeInfo(typeInfo, {
        // tslint:disable-next-line function-name
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