import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/repos")({
  component: ReposPage,
});

function ReposPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold">Your Repositories</h2>
      <p className="mt-2 text-gray-600">Repository list coming next commit.</p>
    </div>
  );
}
