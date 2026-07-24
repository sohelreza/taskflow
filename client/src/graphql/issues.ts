import { graphql } from "@/gql";

export const ISSUES_QUERY = graphql(`
  query GetIssues(
    $owner: String!
    $name: String!
    $after: String
    $states: [IssueState!]
  ) {
    repository(owner: $owner, name: $name) {
      id
      issues(
        first: 20
        after: $after
        orderBy: { field: UPDATED_AT, direction: DESC }
        states: $states
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...IssueCard
        }
      }
    }
  }
`);
