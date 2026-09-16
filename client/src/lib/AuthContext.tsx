import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { logout as apiLogout, fetchAuthState, type AuthState } from "./auth";
import {
  AuthActionsContext,
  AuthStateContext,
  type AuthActionsContextValue,
} from "./authContextInternal";

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

  const actionsValue = useMemo<AuthActionsContextValue>(
    () => ({ refresh, logout: handleLogout }),
    [refresh, handleLogout],
  );

  return (
    <AuthStateContext.Provider value={auth}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
