import { Nav } from "@/components/Nav";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useAuth } from "@/lib/useAuth";
import { createRootRoute, Outlet, useSearch } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

type RootSearch = {
  auth_error?: string;
};

export const Route = createRootRoute({
  component: RootComponent,
  validateSearch: (search: Record<string, unknown>): RootSearch => {
    return {
      auth_error:
        typeof search.auth_error === "string" ? search.auth_error : undefined,
    };
  },
});

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was canceled.",
  state_mismatch: "Session expired. Please try again.",
  missing_params: "Sign-in failed. Please try again.",
  missing_verifier: "Sign-in session expired. Please try again.",
  token_exchange_failed: "Couldn't complete sign-in with GitHub.",
  viewer_lookup_failed: "Couldn't verify your GitHub identity.",
};

function RootComponent() {
  const { auth } = useAuth();
  const { auth_error } = useSearch({ strict: false }) as {
    auth_error?: string;
  };

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    const errorMessage = auth_error
      ? (AUTH_ERROR_MESSAGES[auth_error] ?? "Sign-in failed. Please try again.")
      : undefined;
    return (
      <>
        <SignInPrompt errorMessage={errorMessage} />
        <TanStackRouterDevtools />
      </>
    );
  }

  return (
    <div>
      <Nav />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}
