import { createContext } from "react";
import type { AuthState } from "./auth";

export type AuthContextValue = {
  auth: AuthState;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
