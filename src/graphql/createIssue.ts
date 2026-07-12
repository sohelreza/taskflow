import { graphql } from "@/gql";

export const CREATE_ISSUE_MUTATION = graphql(`
  mutation CreateIssue($input: CreateIssueInput!) {
    createIssue(input: $input) {
      issue {
        ...IssueCard
      }
    }
  }
`);
