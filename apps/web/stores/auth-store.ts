import { create } from "zustand";
import type { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setToken: (token) => set({ token, isLoading: false }),
  logout: () => set({ user: null, token: null, isLoading: false }),
}));
