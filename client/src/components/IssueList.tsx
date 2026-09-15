/* eslint-disable react-refresh/only-export-components -- compound component pattern intentionally colocates subcomponents and namespace export */

import { Button } from "@/components/ui/button";
import { useCloseIssue } from "@/hooks/useCloseIssue";
import { createContext, useContext, type ReactNode } from "react";

type Label = {
  id: string;
  name: string;
  color: string;
};

type Issue = {
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
    nodes?: Array<Label | null> | null;
  } | null;
  comments: {
    totalCount: number;
  };
};

// Shared context so subcomponents can access the current issue
const IssueContext = createContext<Issue | null>(null);

function useIssue() {
  const issue = useContext(IssueContext);
  if (!issue) {
    throw new Error(
      "IssueList subcomponents must be used inside <IssueList.Item>",
    );
  }
  return issue;
}

// --- Root ---
function Root({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ul className="divide-y divide-gray-200 border border-gray-200 rounded overflow-hidden">
      {children}
    </ul>
  );
}

// --- Empty state ---
function Empty({ children }: Readonly<{ children: ReactNode }>) {
  return <li className="p-4 text-gray-600">{children}</li>;
}

// --- Item wrapper ---
function Item({
  issue,
  children,
}: Readonly<{ issue: Issue; children: ReactNode }>) {
  return (
    <IssueContext.Provider value={issue}>
      <li className="p-4 bg-white hover:bg-gray-50">
        <div className="flex items-start gap-3">{children}</div>
      </li>
    </IssueContext.Provider>
  );
}

// --- State icon ---
function StateIcon() {
  const issue = useIssue();
  const color = issue.state === "OPEN" ? "text-green-600" : "text-purple-600";
  return (
    <span
      className={`inline-block mt-1 ${color}`}
      title={issue.state.toLowerCase()}
    >
      {issue.state === "OPEN" ? "○" : "●"}
    </span>
  );
}

// --- Title + number ---
function Title() {
  const issue = useIssue();
  return (
    <div className="font-medium text-gray-900">
      {issue.title}
      <span className="text-gray-500 font-normal ml-2">#{issue.number}</span>
    </div>
  );
}

// --- Metadata line ---
function Meta() {
  const issue = useIssue();
  return (
    <div className="mt-1 text-sm text-gray-600">
      {issue.state === "OPEN" ? "opened" : "closed"}{" "}
      {new Date(issue.updatedAt).toLocaleDateString()}
      {issue.author && <> by {issue.author.login}</>}
    </div>
  );
}

// --- Labels ---
function Labels() {
  const issue = useIssue();
  const labelNodes = issue.labels?.nodes ?? [];
  if (labelNodes.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {labelNodes.map((label) => {
        if (!label) return null;
        return (
          <span
            key={label.id}
            className="inline-block px-2 py-0.5 text-xs rounded-full"
            style={{
              backgroundColor: `#${label.color}20`,
              color: `#${label.color}`,
              border: `1px solid #${label.color}40`,
            }}
          >
            {label.name}
          </span>
        );
      })}
    </div>
  );
}

// --- Content wrapper for main text area ---
function Content({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="flex-1 min-w-0">{children}</div>;
}

// --- Comment count ---
function CommentCount() {
  const issue = useIssue();
  if (issue.comments.totalCount === 0) return null;
  return (
    <div className="text-sm text-gray-500 whitespace-nowrap">
      💬 {issue.comments.totalCount}
    </div>
  );
}

// --- Actions wrapper (right side) ---
function Actions({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="flex items-center gap-3">{children}</div>;
}

// --- Close button ---
function CloseButton() {
  const issue = useIssue();
  const { closeIssue, loading } = useCloseIssue();

  if (issue.state !== "OPEN") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => closeIssue(issue)}
      disabled={loading}
    >
      {loading ? "Closing..." : "Close"}
    </Button>
  );
}

// --- The compound export ---
export const IssueList = {
  Root,
  Empty,
  Item,
  StateIcon,
  Content,
  Title,
  Meta,
  Labels,
  CommentCount,
  Actions,
  CloseButton,
};
