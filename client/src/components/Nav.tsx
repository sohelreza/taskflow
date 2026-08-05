import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { Link } from "@tanstack/react-router";

export function Nav() {
  const { auth, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 px-8 py-3">
      <div className="flex items-center justify-between">
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

        {auth.status === "authenticated" && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">@{auth.login}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
