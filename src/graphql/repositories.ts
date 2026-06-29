import { graphql } from "@/gql";

export const REPOSITORIES_QUERY = graphql(`
  query GetRepositories {
    viewer {
      repositories(first: 20, orderBy: { field: UPDATED_AT, direction: DESC }) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          nameWithOwner
          description
          stargazerCount
          updatedAt
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
`);
