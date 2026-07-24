import { graphql } from "@/gql";

export const ISSUE_CARD_FRAGMENT = graphql(`
  fragment IssueCard on Issue {
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
`);
