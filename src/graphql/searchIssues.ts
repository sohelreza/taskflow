import { graphql } from "@/gql";

export const SEARCH_ISSUES_QUERY = graphql(`
  query SearchIssues($query: String!, $after: String) {
    search(query: $query, type: ISSUE, first: 20, after: $after) {
      issueCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on Issue {
          ...IssueCard
        }
      }
    }
  }
`);
