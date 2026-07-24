import { graphql } from "@/gql";

export const REPOSITORY_QUERY = graphql(`
  query GetRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      nameWithOwner
      description
      stargazerCount
      forkCount
      updatedAt
      createdAt
      homepageUrl
      url
      primaryLanguage {
        name
        color
      }
      owner {
        login
        avatarUrl
      }
    }
  }
`);
