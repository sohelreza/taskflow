/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetRepositories($after: String) {\n    viewer {\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetRepositoriesDocument,
    "\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n": typeof types.GetViewerDocument,
};
const documents: Documents = {
    "\n  query GetRepositories($after: String) {\n    viewer {\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n": types.GetRepositoriesDocument,
    "\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n": types.GetViewerDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepositories($after: String) {\n    viewer {\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRepositories($after: String) {\n    viewer {\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;