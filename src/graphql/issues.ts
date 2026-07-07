import { graphql } from "@/gql";

export const ISSUES_QUERY = graphql(`
  query GetIssues($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      id
      issues(
        first: 20
        after: $after
        orderBy: { field: UPDATED_AT, direction: DESC }
        states: [OPEN, CLOSED]
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          title
          state
          createdAt
          updatedAt
          author {
            login
            avatarUrl
          }
          labels(first: 5) {
            nodes {
              id
              name
              color
            }
          }
          comments {
            totalCount
          }
        }
      }
    }
  }
`);
