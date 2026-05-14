import { Button } from "@/components/ui/button";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import "./App.css";

const VIEWER_QUERY = gql`
  query GetViewer {
    viewer {
      id
      login
      name
      avatarUrl
    }
  }
`;

type ViewerData = {
  viewer: {
    id: string;
    login: string;
    name: string;
    avatarUrl: string;
  };
};

function App() {
  const { data, loading, error, refetch } = useQuery<ViewerData>(VIEWER_QUERY);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">TaskFlow</h1>

      {loading && (
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded">
          <div className="text-red-800 font-medium">
            Couldn't load your profile
          </div>
          <div className="text-red-600 text-sm mt-1">{error.message}</div>
          <Button
            onClick={() => refetch()}
            variant="destructive"
            size="sm"
            className="mt-2"
          >
            Try again
          </Button>
        </div>
      )}

      {data && (
        <div className="mt-4 flex items-center gap-3">
          <img
            src={data.viewer.avatarUrl}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-medium">{data.viewer.name}</div>
            <div className="text-gray-600 text-sm">@{data.viewer.login}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
