import { Button } from "@/components/ui/button";
import { REPOSITORIES_QUERY } from "@/graphql/repositories";
import { useQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/repos")({
  component: ReposPage,
});

function ReposPage() {
  const { data, loading, error, fetchMore } = useQuery(REPOSITORIES_QUERY);

  if (loading && !data) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Your Repositories</h2>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Your Repositories</h2>
        <p className="mt-4 text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  const repositories = data?.viewer.repositories.nodes ?? [];
  const totalCount = data?.viewer.repositories.totalCount ?? 0;
  const pageInfo = data?.viewer.repositories.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const endCursor = pageInfo?.endCursor;

  const handleLoadMore = () => {
    if (!endCursor) return;
    fetchMore({
      variables: { after: endCursor },
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-semibold">Your Repositories</h2>
        <span className="text-sm text-gray-600">
          Showing {repositories.length} of {totalCount}
        </span>
      </div>

      {repositories.length === 0 && (
        <p className="text-gray-600">No repositories found.</p>
      )}

      <ul className="space-y-3">
        {repositories.map((repo) => {
          if (!repo) return null;
          return (
            <li
              key={repo.id}
              className="p-4 border border-gray-200 rounded hover:border-gray-300 transition-colors"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium text-blue-700 hover:underline">
                  {repo.nameWithOwner}
                </h3>
                <span className="text-sm text-gray-600">
                  ★ {repo.stargazerCount}
                </span>
              </div>
              {repo.description && (
                <p className="mt-1 text-sm text-gray-700">{repo.description}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                {repo.primaryLanguage && (
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: repo.primaryLanguage.color ?? "#888",
                      }}
                    />
                    {repo.primaryLanguage.name}
                  </span>
                )}
                <span>
                  Updated {new Date(repo.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button onClick={handleLoadMore} variant="outline" disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
