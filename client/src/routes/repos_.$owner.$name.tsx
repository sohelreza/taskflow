import { IssueList } from "@/components/IssueList";
import { NewIssueDialog } from "@/components/NewIssueDialog";
import { Button } from "@/components/ui/button";
import { ISSUES_QUERY } from "@/graphql/issues";
import { REPOSITORY_QUERY } from "@/graphql/repository";
import { SEARCH_ISSUES_QUERY } from "@/graphql/searchIssues";
import { VIEWER_QUERY } from "@/graphql/viewer";
import { useQuery } from "@apollo/client/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type IssueStateFilter = "open" | "closed" | "all";

function toGraphQLStates(
  state: IssueStateFilter | undefined,
): Array<"OPEN" | "CLOSED"> {
  if (state === "closed") return ["CLOSED"];
  if (state === "all") return ["OPEN", "CLOSED"];
  return ["OPEN"];
}

function toSearchQualifier(state: IssueStateFilter | undefined): string {
  if (state === "all") return "";
  if (state === "closed") return "is:closed ";
  return "is:open ";
}

type IssuesSearch = {
  q?: string;
  state?: IssueStateFilter;
};

type IssueShape = {
  id: string;
  number: number;
  title: string;
  state: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  author?: { login: string; avatarUrl: string } | null;
  labels?: {
    nodes?: Array<{ id: string; name: string; color: string } | null> | null;
  } | null;
  comments: { totalCount: number };
};

function isIssue(node: unknown): node is IssueShape {
  return (
    typeof node === "object" &&
    node !== null &&
    "id" in node &&
    "number" in node &&
    "title" in node
  );
}

export const Route = createFileRoute("/repos_/$owner/$name")({
  component: RepositoryDetailPage,
  validateSearch: (search: Record<string, unknown>): IssuesSearch => {
    const validStates: IssueStateFilter[] = ["open", "closed", "all"];
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      state:
        typeof search.state === "string" &&
        (validStates as string[]).includes(search.state)
          ? (search.state as IssueStateFilter)
          : undefined,
    };
  },
});

function RepositoryDetailPage() {
  const { owner, name } = Route.useParams();
  const { q, state } = Route.useSearch();
  const { data: viewerData } = useQuery(VIEWER_QUERY);
  const navigate = useNavigate({ from: Route.fullPath });

  const handleSearchCommit = (value: string) => {
    navigate({
      search: (prev) => ({ ...prev, q: value || undefined }),
      replace: true,
    });
  };

  const handleStateChange = (newState: IssueStateFilter | undefined) => {
    navigate({
      search: (prev) => ({ ...prev, state: newState }),
      replace: true,
    });
  };

  // Compute GraphQL state filter
  const issueStates = toGraphQLStates(state);

  const searchQualifier = q
    ? `repo:${owner}/${name} is:issue ${toSearchQualifier(state)}${q}`
    : "";

  const searchQuery = q
    ? `repo:${owner}/${name} is:issue ${searchQualifier}${q}`
    : "";

  const { data, loading, error } = useQuery(REPOSITORY_QUERY, {
    variables: { owner, name },
  });

  const {
    data: issuesData,
    loading: issuesLoading,
    fetchMore: fetchMoreIssues,
  } = useQuery(ISSUES_QUERY, {
    variables: { owner, name, states: issueStates },
    skip: Boolean(q),
  });

  const {
    data: searchData,
    loading: searchLoading,
    fetchMore: fetchMoreSearch,
  } = useQuery(SEARCH_ISSUES_QUERY, {
    variables: { query: searchQuery },
    skip: !q,
  });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!data?.repository) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Repository not found.</p>
      </div>
    );
  }

  const repo = data.repository;

  const activeSearch = Boolean(q);
  const issues: IssueShape[] = activeSearch
    ? (searchData?.search.nodes ?? []).flatMap((n) => (isIssue(n) ? [n] : []))
    : (issuesData?.repository?.issues.nodes ?? []).flatMap((n) =>
        isIssue(n) ? [n] : [],
      );
  const totalIssues = activeSearch
    ? (searchData?.search.issueCount ?? 0)
    : (issuesData?.repository?.issues.totalCount ?? 0);
  const pageInfo = activeSearch
    ? searchData?.search.pageInfo
    : issuesData?.repository?.issues.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;
  const endCursor = pageInfo?.endCursor;
  const listLoading = activeSearch ? searchLoading : issuesLoading;

  const handleLoadMore = () => {
    if (!endCursor) return;
    if (activeSearch) {
      fetchMoreSearch({ variables: { after: endCursor } });
    } else {
      fetchMoreIssues({ variables: { after: endCursor } });
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-4">
        <Link to="/repos" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to repositories
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <img
          src={repo.owner.avatarUrl}
          alt=""
          className="w-8 h-8 rounded-full"
        />
        <h1 className="text-2xl font-semibold">{repo.nameWithOwner}</h1>
      </div>

      {repo.description && (
        <p className="text-gray-700 mb-4">{repo.description}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
        <div>
          <div className="text-xs text-gray-500">Stars</div>
          <div className="text-lg font-medium">★ {repo.stargazerCount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Forks</div>
          <div className="text-lg font-medium">{repo.forkCount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Language</div>
          <div className="text-lg font-medium">
            {repo.primaryLanguage?.name ?? "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Updated</div>
          <div className="text-lg font-medium">
            {new Date(repo.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex gap-3 text-sm mb-8">
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:underline"
        >
          View on GitHub →
        </a>
        {repo.homepageUrl && (
          <a
            href={repo.homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline"
          >
            Homepage →
          </a>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-semibold">Issues</h2>
            <span className="text-sm text-gray-600">
              {issues.length} of {totalIssues}
            </span>
          </div>
          <NewIssueDialog
            owner={owner}
            name={name}
            repositoryId={repo.id}
            viewerLogin={viewerData?.viewer.login ?? ""}
            viewerAvatarUrl={viewerData?.viewer.avatarUrl ?? ""}
          />
        </div>

        <div className="flex gap-1 mb-3 border-b border-gray-200">
          <FilterTab
            label="Open"
            active={!state || state === "open"}
            onClick={() => handleStateChange(undefined)}
          />
          <FilterTab
            label="Closed"
            active={state === "closed"}
            onClick={() => handleStateChange("closed")}
          />
          <FilterTab
            label="All"
            active={state === "all"}
            onClick={() => handleStateChange("all")}
          />
        </div>

        <IssueSearchInput
          key={q ?? ""}
          initialValue={q ?? ""}
          onCommit={handleSearchCommit}
        />

        {listLoading && issues.length === 0 && (
          <p className="text-gray-600">Loading issues...</p>
        )}

        {!listLoading && <IssueList issues={issues} />}

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              disabled={listLoading}
            >
              {listLoading ? "Loading..." : "Load more issues"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function IssueSearchInput({
  initialValue,
  onCommit,
}: Readonly<{
  initialValue: string;
  onCommit: (value: string) => void;
}>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== initialValue) {
        onCommit(value);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, initialValue, onCommit]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search issues..."
      className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
    />
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: Readonly<{
  label: string;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600 -mb-px"
          : "px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      }
    >
      {label}
    </button>
  );
}
