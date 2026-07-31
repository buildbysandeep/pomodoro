"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.token) {
          setUser(data.user);
          setToken(data.token);
        } else {
          logout();
        }
      })
      .catch(() => logout());
  }, [setUser, setToken, logout]);

  return <>{children}</>;
}
