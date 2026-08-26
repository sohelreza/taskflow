import type { CloseIssueMutation } from "@/gql/graphql";
import { CLOSE_ISSUE_MUTATION } from "@/graphql/closeIssue";
import { useMutation } from "@apollo/client/react";

type IssueForClosing = {
  id: string;
  number: number;
  title: string;
  state: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  author?: {
    login: string;
    avatarUrl: string;
  } | null;
  labels?: {
    nodes?: Array<{ id: string; name: string; color: string } | null> | null;
  } | null;
  comments: {
    totalCount: number;
  };
};

export function useCloseIssue() {
  const [closeIssueMutation, { loading }] = useMutation(CLOSE_ISSUE_MUTATION);

  const closeIssue = (issue: IssueForClosing) => {
    return closeIssueMutation({
      variables: { input: { issueId: issue.id } },
      optimisticResponse: {
        closeIssue: {
          __typename: "CloseIssuePayload",
          issue: {
            ...issue,
            __typename: "Issue",
            state: "CLOSED",
            updatedAt: new Date().toISOString(),
          },
        },
      } as unknown as CloseIssueMutation,
    });
  };

  return { closeIssue, loading };
}
