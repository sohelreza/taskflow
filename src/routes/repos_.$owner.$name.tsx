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

      <div className="flex gap-3 text-sm">
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

      <div className="mt-8">
        <p className="text-gray-600">Issues coming next commit.</p>
      </div>
    </div>
  );
}
