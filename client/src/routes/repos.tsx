import { RepositoryCard } from "@/components/RepositoryCard";
import { Button } from "@/components/ui/button";
import { REPOSITORIES_QUERY } from "@/graphql/repositories";
import { useSuspenseQuery } from "@apollo/client/react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, type ComponentType } from "react";
import {
  ErrorBoundary as ErrorBoundaryBase,
  type ErrorBoundaryProps,
  type FallbackProps,
} from "react-error-boundary";

const ErrorBoundary =
  ErrorBoundaryBase as unknown as ComponentType<ErrorBoundaryProps>;

export const Route = createFileRoute("/repos")({
  component: ReposPage,
});

function ReposPage() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Your Repositories</h1>
      <ErrorBoundary
        FallbackComponent={ReposErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={<ReposSkeleton />}>
          <ReposList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ReposList() {
  const { data, dataState, fetchMore } = useSuspenseQuery(REPOSITORIES_QUERY);

  if (dataState !== "complete") {
    return null;
  }

  const repos = data.viewer.repositories.nodes ?? [];
  const pageInfo = data.viewer.repositories.pageInfo;

  return (
    <>
      <div className="space-y-3">
        {repos.map(
          (repo) => repo && <RepositoryCard key={repo.id} repo={repo} />,
        )}
      </div>
      {pageInfo.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              fetchMore({
                variables: { after: pageInfo.endCursor },
              })
            }
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}

function ReposSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="p-4 border border-gray-200 rounded animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function ReposErrorFallback({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded text-red-700">
      <p className="font-medium mb-2">Failed to load repositories</p>
      <p className="text-sm mb-3">{message}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}
