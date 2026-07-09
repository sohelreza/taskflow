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
    "\n  query GetIssues(\n    $owner: String!\n    $name: String!\n    $after: String\n    $states: [IssueState!]\n  ) {\n    repository(owner: $owner, name: $name) {\n      id\n      issues(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n        states: $states\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetIssuesDocument,
    "\n  query GetRepositories($after: String) {\n    viewer {\n      id\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          owner {\n            login\n          }\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetRepositoriesDocument,
    "\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      id\n      nameWithOwner\n      description\n      stargazerCount\n      forkCount\n      updatedAt\n      createdAt\n      homepageUrl\n      url\n      primaryLanguage {\n        name\n        color\n      }\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n": typeof types.GetRepositoryDocument,
    "\n  query SearchIssues($query: String!, $after: String) {\n    search(query: $query, type: ISSUE, first: 20, after: $after) {\n      issueCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      nodes {\n        ... on Issue {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n": typeof types.SearchIssuesDocument,
    "\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n": typeof types.GetViewerDocument,
};
const documents: Documents = {
    "\n  query GetIssues(\n    $owner: String!\n    $name: String!\n    $after: String\n    $states: [IssueState!]\n  ) {\n    repository(owner: $owner, name: $name) {\n      id\n      issues(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n        states: $states\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n": types.GetIssuesDocument,
    "\n  query GetRepositories($after: String) {\n    viewer {\n      id\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          owner {\n            login\n          }\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n": types.GetRepositoriesDocument,
    "\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      id\n      nameWithOwner\n      description\n      stargazerCount\n      forkCount\n      updatedAt\n      createdAt\n      homepageUrl\n      url\n      primaryLanguage {\n        name\n        color\n      }\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n": types.GetRepositoryDocument,
    "\n  query SearchIssues($query: String!, $after: String) {\n    search(query: $query, type: ISSUE, first: 20, after: $after) {\n      issueCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      nodes {\n        ... on Issue {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n": types.SearchIssuesDocument,
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
export function graphql(source: "\n  query GetIssues(\n    $owner: String!\n    $name: String!\n    $after: String\n    $states: [IssueState!]\n  ) {\n    repository(owner: $owner, name: $name) {\n      id\n      issues(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n        states: $states\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetIssues(\n    $owner: String!\n    $name: String!\n    $after: String\n    $states: [IssueState!]\n  ) {\n    repository(owner: $owner, name: $name) {\n      id\n      issues(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n        states: $states\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepositories($after: String) {\n    viewer {\n      id\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          owner {\n            login\n          }\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRepositories($after: String) {\n    viewer {\n      id\n      repositories(\n        first: 20\n        after: $after\n        orderBy: { field: UPDATED_AT, direction: DESC }\n      ) {\n        totalCount\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          name\n          nameWithOwner\n          description\n          stargazerCount\n          updatedAt\n          owner {\n            login\n          }\n          primaryLanguage {\n            name\n            color\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      id\n      nameWithOwner\n      description\n      stargazerCount\n      forkCount\n      updatedAt\n      createdAt\n      homepageUrl\n      url\n      primaryLanguage {\n        name\n        color\n      }\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRepository($owner: String!, $name: String!) {\n    repository(owner: $owner, name: $name) {\n      id\n      nameWithOwner\n      description\n      stargazerCount\n      forkCount\n      updatedAt\n      createdAt\n      homepageUrl\n      url\n      primaryLanguage {\n        name\n        color\n      }\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchIssues($query: String!, $after: String) {\n    search(query: $query, type: ISSUE, first: 20, after: $after) {\n      issueCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      nodes {\n        ... on Issue {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchIssues($query: String!, $after: String) {\n    search(query: $query, type: ISSUE, first: 20, after: $after) {\n      issueCount\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      nodes {\n        ... on Issue {\n          id\n          number\n          title\n          state\n          createdAt\n          updatedAt\n          author {\n            login\n            avatarUrl\n          }\n          labels(first: 5) {\n            nodes {\n              id\n              name\n              color\n            }\n          }\n          comments {\n            totalCount\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  query GetViewer {\n    viewer {\n      id\n      login\n      name\n      avatarUrl\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;