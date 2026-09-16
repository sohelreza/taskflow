import { useContext } from "react";
import { AuthActionsContext, AuthStateContext } from "./authContextInternal";

export function useAuthState() {
  const state = useContext(AuthStateContext);
  if (!state) {
    throw new Error("useAuthState must be used inside <AuthProvider>");
  }
  return state;
}

export function useAuthActions() {
  const actions = useContext(AuthActionsContext);
  if (!actions) {
    throw new Error("useAuthActions must be used inside <AuthProvider>");
  }
  return actions;
}

// Backward-compat shim — returns both
export function useAuth() {
  return {
    auth: useAuthState(),
    ...useAuthActions(),
  };
}
