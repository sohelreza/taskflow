import { createContext } from "react";
import type { AuthState } from "./auth";

export type AuthActionsContextValue = {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthStateContext = createContext<AuthState | null>(null);
export const AuthActionsContext = createContext<AuthActionsContextValue | null>(
  null,
);
