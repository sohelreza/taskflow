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

function App() {
  const { data, loading, error } = useQuery<{
    viewer: { id: string; login: string; name: string; avatarUrl: string };
  }>(VIEWER_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">TaskFlow</h1>
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
    </div>
  );
}

export default App;
