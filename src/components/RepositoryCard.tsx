type RepositoryCardProps = {
  repo: {
    id: string;
    nameWithOwner: string;
    description?: string | null;
    stargazerCount: number;
    updatedAt: string;
    primaryLanguage?: {
      name: string;
      color?: string | null;
    } | null;
  };
};

export function RepositoryCard({ repo }: Readonly<RepositoryCardProps>) {
  return (
    <div className="p-4 border border-gray-200 rounded hover:border-gray-300 transition-colors">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium text-blue-700 hover:underline">
          {repo.nameWithOwner}
        </h3>
        <span className="text-sm text-gray-600">★ {repo.stargazerCount}</span>
      </div>
      {repo.description && (
        <p className="mt-1 text-sm text-gray-700">{repo.description}</p>
      )}
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        {repo.primaryLanguage && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: repo.primaryLanguage.color ?? "#888" }}
            />
            {repo.primaryLanguage.name}
          </span>
        )}
        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
