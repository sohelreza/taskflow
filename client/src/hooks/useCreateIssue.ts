import type { CreateIssueMutation } from "@/gql/graphql";
import { CREATE_ISSUE_MUTATION } from "@/graphql/createIssue";
import { ISSUE_CARD_FRAGMENT } from "@/graphql/fragments";
import type { Reference, StoreObject } from "@apollo/client";
import { isReference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

type CreateIssueParams = {
  repositoryId: string;
  title: string;
  body?: string;
  viewerLogin: string;
  viewerAvatarUrl: string;
};

export function useCreateIssue() {
  const [createIssueMutation, { loading }] = useMutation(CREATE_ISSUE_MUTATION);

  const createIssue = async ({
    repositoryId,
    title,
    body,
    viewerLogin,
    viewerAvatarUrl,
  }: CreateIssueParams) => {
    const now = new Date().toISOString();
    const optimisticId = `optimistic-${crypto.randomUUID()}`;

    return createIssueMutation({
      variables: {
        input: {
          repositoryId,
          title,
          body: body || undefined,
        },
      },
      optimisticResponse: {
        createIssue: {
          __typename: "CreateIssuePayload",
          issue: {
            __typename: "Issue",
            id: optimisticId,
            number: 0,
            title,
            state: "OPEN",
            createdAt: now,
            updatedAt: now,
            author: {
              __typename: "User",
              login: viewerLogin,
              avatarUrl: viewerAvatarUrl,
            },
            labels: {
              __typename: "LabelConnection",
              nodes: [],
            },
            comments: {
              __typename: "IssueCommentConnection",
              totalCount: 0,
            },
          },
        },
      } as unknown as CreateIssueMutation,
      update(cache, { data }) {
        const newIssue = data?.createIssue?.issue;
        if (!newIssue) return;

        const repositoryCacheId = cache.identify({
          __typename: "Repository",
          id: repositoryId,
        });
        if (!repositoryCacheId) return;

        const newIssueRef = cache.writeFragment({
          data: newIssue,
          fragment: ISSUE_CARD_FRAGMENT,
        });
        if (!newIssueRef) return;

        cache.modify({
          id: repositoryCacheId,
          fields: {
            issues(existing, { readField }) {
              if (isReference(existing)) return existing;

              const existingIssues =
                (existing as {
                  totalCount?: number;
                  nodes?: Array<Reference | StoreObject>;
                }) ?? {};

              const existingNodes = existingIssues.nodes ?? [];

              const hasMatchingId = (nodeRef: Reference | StoreObject) =>
                readField<string>("id", nodeRef) === newIssue.id;

              if (existingNodes.some(hasMatchingId)) return existingIssues;

              return {
                ...existingIssues,
                totalCount: (existingIssues.totalCount ?? 0) + 1,
                nodes: [newIssueRef, ...existingNodes],
              };
            },
          },
        });
      },
    });
  };

  return { createIssue, loading };
}
