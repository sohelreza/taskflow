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
import { useState } from "react";

type NewIssueDialogProps = {
  owner: string;
  name: string;
};

export function NewIssueDialog({ owner, name }: Readonly<NewIssueDialogProps>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Issue</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New issue</DialogTitle>
          <DialogDescription>
            Create a new issue in {owner}/{name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600">
            Form goes here in the next commit.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled>Create issue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
