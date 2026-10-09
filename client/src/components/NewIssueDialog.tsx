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
import { useCreateIssue } from "@/hooks/useCreateIssue";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LiveAnnouncer } from "./LiveAnnouncer";

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
  const [announcement, setAnnouncement] = useState("");
  const { createIssue } = useCreateIssue();

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

    try {
      await createIssue({
        repositoryId,
        title: values.title,
        body: values.body,
        viewerLogin,
        viewerAvatarUrl,
      });
      setAnnouncement(`Issue created: ${values.title}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create issue";
      setSubmitError(message);
      setOpen(true);
      setAnnouncement(`Error creating issue: ${message}`);
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
    <>
      <LiveAnnouncer message={announcement} />
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
                  aria-invalid={errors.title ? "true" : "false"}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  {...register("title")}
                />
                {errors.title && (
                  <p
                    id="title-error"
                    className="text-sm text-red-600"
                    role="alert"
                  >
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Description (optional)</Label>
                <Textarea
                  id="body"
                  placeholder="More details about the issue..."
                  rows={5}
                  aria-invalid={errors.body ? "true" : "false"}
                  aria-describedby={errors.body ? "body-error" : undefined}
                  {...register("body")}
                />
                {errors.body && (
                  <p
                    id="body-error"
                    className="text-sm text-red-600"
                    role="alert"
                  >
                    {errors.body.message}
                  </p>
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
    </>
  );
}
