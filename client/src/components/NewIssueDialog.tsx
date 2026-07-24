import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateIssueMutation } from "@/gql/graphql";
import { CREATE_ISSUE_MUTATION } from "@/graphql/createIssue";
import { ISSUE_CARD_FRAGMENT } from "@/graphql/fragments";
import type { Reference, StoreObject } from "@apollo/client";
import { isReference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const newIssueSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(256, "Title must be at most 256 characters"),
  body: z.string().optional(),
});

type NewIssueFormValues = z.infer<typeof newIssueSchema>;

type NewIssueDialogProps = {
  owner: string;
  name: string;
  repositoryId: string;
  viewerLogin: string;
  viewerAvatarUrl: string;
};

export function NewIssueDialog({
  owner,
  name,
  repositoryId,
  viewerLogin,
  viewerAvatarUrl,
}: Readonly<NewIssueDialogProps>) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [createIssue] = useMutation(CREATE_ISSUE_MUTATION);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewIssueFormValues>({
    resolver: zodResolver(newIssueSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: NewIssueFormValues) => {
    setSubmitError(null);

    reset();
    setOpen(false);

    const now = new Date().toISOString();
    const optimisticId = `optimistic-${crypto.randomUUID()}`;

    try {
      await createIssue({
        variables: {
          input: {
            repositoryId,
            title: values.title,
            body: values.body || undefined,
          },
        },
        optimisticResponse: {
          createIssue: {
            __typename: "CreateIssuePayload",
            issue: {
              __typename: "Issue",
              id: optimisticId,
              number: 0,
              title: values.title,
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create issue";
      setSubmitError(message);
      setOpen(true);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setSubmitError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">New Issue</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>New issue</DialogTitle>
            <DialogDescription>
              Create a new issue in {owner}/{name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                autoFocus
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Description (optional)</Label>
              <Textarea
                id="body"
                placeholder="More details about the issue..."
                rows={5}
                {...register("body")}
              />
              {errors.body && (
                <p className="text-sm text-red-600">{errors.body.message}</p>
              )}
            </div>

            {submitError && (
              <div className="p-3 border border-red-200 bg-red-50 rounded text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Create issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
