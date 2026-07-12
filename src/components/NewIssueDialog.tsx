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
import { CREATE_ISSUE_MUTATION } from "@/graphql/createIssue";
import { ISSUES_QUERY } from "@/graphql/issues";
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
};

export function NewIssueDialog({
  owner,
  name,
  repositoryId,
}: NewIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [createIssue, { loading: mutationLoading }] = useMutation(
    CREATE_ISSUE_MUTATION,
    {
      refetchQueries: [
        {
          query: ISSUES_QUERY,
          variables: { owner, name, states: ["OPEN"] },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

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
    try {
      await createIssue({
        variables: {
          input: {
            repositoryId,
            title: values.title,
            body: values.body || undefined,
          },
        },
      });
      reset();
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create issue";
      setSubmitError(message);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutationLoading) return;
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
                disabled={mutationLoading}
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
                disabled={mutationLoading}
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
              disabled={mutationLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || mutationLoading}>
              {mutationLoading ? "Creating..." : "Create issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
