import { IssueList } from "@/components/IssueList";
import { Button } from "@/components/ui/button";
import { ISSUES_QUERY } from "@/graphql/issues";
import { REPOSITORY_QUERY } from "@/graphql/repository";
import { useQuery } from "@apollo/client/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/repos_/$owner/$name")({
  component: RepositoryDetailPage,
});

function RepositoryDetailPage() {
  const { owner, name } = Route.useParams();

  const { data, loading, error } = useQuery(REPOSITORY_QUERY, {
    variables: { owner, name },
  });

  const {
    data: issuesData,
    loading: issuesLoading,
    error: issuesError,
    fetchMore: fetchMoreIssues,
  } = useQuery(ISSUES_QUERY, {
    variables: { owner, name },
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
  const issues = issuesData?.repository?.issues.nodes ?? [];
  const totalIssues = issuesData?.repository?.issues.totalCount ?? 0;
  const issuesPageInfo = issuesData?.repository?.issues.pageInfo;
  const hasMoreIssues = issuesPageInfo?.hasNextPage ?? false;
  const issuesEndCursor = issuesPageInfo?.endCursor;

  const handleLoadMoreIssues = () => {
    if (!issuesEndCursor) return;
    fetchMoreIssues({
      variables: { after: issuesEndCursor },
    });
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
          <h2 className="text-xl font-semibold">Issues</h2>
          <span className="text-sm text-gray-600">
            {issues.length} of {totalIssues}
          </span>
        </div>

        {issuesLoading && issues.length === 0 && (
          <p className="text-gray-600">Loading issues...</p>
        )}

        {issuesError && (
          <p className="text-red-600">
            Error loading issues: {issuesError.message}
          </p>
        )}

        {!issuesLoading && !issuesError && <IssueList issues={issues} />}

        {hasMoreIssues && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleLoadMoreIssues}
              variant="outline"
              disabled={issuesLoading}
            >
              {issuesLoading ? "Loading..." : "Load more issues"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
