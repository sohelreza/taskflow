import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <nav className="border-b border-gray-200 px-8 py-3">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="font-semibold text-lg"
          activeProps={{ className: "text-blue-600" }}
          inactiveProps={{ className: "text-gray-900" }}
        >
          TaskFlow
        </Link>
        <Link
          to="/repos"
          className="font-medium"
          activeProps={{ className: "text-blue-600" }}
          inactiveProps={{ className: "text-gray-600 hover:text-gray-900" }}
        >
          Repositories
        </Link>
      </div>
    </nav>
  );
}
