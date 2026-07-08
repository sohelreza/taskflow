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

type IssueListProps = {
  issues: Issue[];
};

export function IssueList({ issues }: Readonly<IssueListProps>) {
  if (issues.length === 0) {
    return <p className="text-gray-600">No issues found.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 border border-gray-200 rounded overflow-hidden">
      {issues.map((issue) => {
        const labelNodes = issue.labels?.nodes ?? [];
        return (
          <li key={issue.id} className="p-4 bg-white hover:bg-gray-50">
            <div className="flex items-start gap-3">
              <StateIcon state={issue.state} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                  {issue.title}
                  <span className="text-gray-500 font-normal ml-2">
                    #{issue.number}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {issue.state === "OPEN" ? "opened" : "closed"}{" "}
                  {new Date(issue.updatedAt).toLocaleDateString()}
                  {issue.author && <> by {issue.author.login}</>}
                </div>
                {labelNodes.length > 0 && (
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
                )}
              </div>
              {issue.comments.totalCount > 0 && (
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  💬 {issue.comments.totalCount}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StateIcon({ state }: Readonly<{ state: "OPEN" | "CLOSED" }>) {
  const color = state === "OPEN" ? "text-green-600" : "text-purple-600";
  return (
    <span className={`inline-block mt-1 ${color}`} title={state.toLowerCase()}>
      {state === "OPEN" ? "○" : "●"}
    </span>
  );
}
