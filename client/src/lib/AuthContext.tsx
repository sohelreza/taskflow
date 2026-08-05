import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logout as apiLogout, fetchAuthState, type AuthState } from "./auth";
import { AuthContext, type AuthContextValue } from "./authContextInternal";

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    const next = await fetchAuthState();
    setAuth(next);
  }, []);

  const handleLogout = useCallback(async () => {
    await apiLogout();
    setAuth({ status: "unauthenticated" });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate external state sync
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({ auth, refresh, logout: handleLogout }),
    [auth, refresh, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
