import { graphql } from "@/gql";

export const VIEWER_QUERY = graphql(`
  query GetViewer {
    viewer {
      id
      login
      name
      avatarUrl
    }
  }
`);
