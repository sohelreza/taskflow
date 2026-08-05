export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; login: string }
  | { status: "unauthenticated" };

export async function fetchAuthState(): Promise<AuthState> {
  try {
    const response = await fetch("/auth/me", {
      credentials: "include",
    });
    if (response.status === 401) {
      return { status: "unauthenticated" };
    }
    if (!response.ok) {
      return { status: "unauthenticated" };
    }
    const data = (await response.json()) as {
      authenticated: boolean;
      login?: string;
    };
    if (data.authenticated && data.login) {
      return { status: "authenticated", login: data.login };
    }
    return { status: "unauthenticated" };
  } catch {
    return { status: "unauthenticated" };
  }
}

export async function logout(): Promise<void> {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
