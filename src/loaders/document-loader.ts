import {Document, Source, parse} from 'graphql';
import * as fs from 'fs';
import * as path from 'path';
import {extractDocumentStringFromCodeFile} from '../utils/document-finder';

function concatAST(asts: Array<Document>): Document {
  const batchDefinitions = [];
  for (let i = 0; i < asts.length; i++) {
    const definitions = asts[i].definitions;
    for (let j = 0; j < definitions.length; j++) {
      batchDefinitions.push(definitions[j]);
    }
  }
  return {
    kind: 'Document',
    definitions: batchDefinitions,
  };
}

export const loadFileContent = (filePath: string): Document | null => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath);

    if (fileExt === '.graphql' || fileExt === '.gql') {
      return parse(new Source(fileContent, filePath));
    }

    const foundDoc = extractDocumentStringFromCodeFile(fileContent);

    if (foundDoc) {
      return parse(new Source(foundDoc, filePath));
    }
    else {
      return null;
    }
  } else {
    throw new Error(`Document file ${filePath} does not exists!`);
  }
};

export const loadDocumentsSources = (filePaths: string[]): Document => {
  return concatAST(filePaths.map<Document>(loadFileContent).filter(content => content));
};
