import { graphql } from "@/gql";

export const CLOSE_ISSUE_MUTATION = graphql(`
  mutation CloseIssue($input: CloseIssueInput!) {
    closeIssue(input: $input) {
      issue {
        ...IssueCard
      }
    }
  }
`);
