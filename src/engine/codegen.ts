import {GraphQLSchema} from 'graphql';
import {Codegen, Model, CodegenDocument} from '../models/interfaces';
import {Kind, GraphQLNamedType, Definition, Document} from 'graphql';
import {handleType} from '../handlers/model-handler';
import {handleOperation} from '../handlers/operation-handler';
import {handleFragment} from '../handlers/fragment-handler';

export interface CodegenConfig {
  flattenInnerTypes?: boolean;
  noSchema?: boolean;
  noDocuments?: boolean;
}

export const prepareCodegen = (schema: GraphQLSchema,
                               document: Document,
                               primitivesMap: any = {},
                               config: CodegenConfig = {}): Codegen => {
  let models: Model[] = [];
  let documents: CodegenDocument[] = [];
  let typesMap: GraphQLNamedType = schema.getTypeMap() as any;

  Object.keys(typesMap).forEach(typeName => {
    models.push(...handleType(schema, primitivesMap, typesMap[typeName]));
  });

  if (!config.noDocuments) {
    document.definitions.forEach((definition: Definition) => {
      switch (definition.kind) {
        case Kind.OPERATION_DEFINITION:
          documents.push(handleOperation(schema, definition, primitivesMap, config.flattenInnerTypes));
          break;

        case Kind.FRAGMENT_DEFINITION:
          documents.push(handleFragment(schema, definition, primitivesMap, config.flattenInnerTypes));
          break;

        default:
          break;
      }
    });
  }

  return <Codegen>{
    models: models.filter(item => {
      if (item) {
        return !(config.noSchema && !item.isEnum);
      }

      return false;
    }),
    documents: documents.filter(item => item)
  };
};
