import { Nav } from "@/components/Nav";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/lib/useAuth";
import { createRootRoute, Outlet, useSearch } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

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

function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-gray-600 text-sm">{message}</p>
        <Button onClick={resetErrorBoundary}>Reload the app</Button>
      </div>
    </div>
  );
}

function RootComponent() {
  const auth = useAuthState();
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
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Nav />
      <Outlet />
      <TanStackRouterDevtools />
    </ErrorBoundary>
  );
}
