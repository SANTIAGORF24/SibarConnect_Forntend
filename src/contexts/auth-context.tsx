"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserDTO, type LoginPayload, type RoleDTO } from "@/api";
import { getSession, saveSession, clearSession } from "@/auth/session";

interface AuthContextType {
  currentUser: UserDTO | null;
  login: (payload: LoginPayload, remember?: boolean) => Promise<void>;
  logout: () => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const existing = getSession();
    if (existing) setCurrentUser(existing);
    setIsReady(true);
  }, []);

  const login = async (payload: LoginPayload, remember: boolean = true) => {
    const user = await api.auth.login(payload);
    setCurrentUser(user);
    saveSession(user, remember);
  };

  const logout = () => {
    setCurrentUser(null);
    clearSession();
  };

  const value = useMemo(() => ({ currentUser, login, logout, isReady }), [currentUser, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


