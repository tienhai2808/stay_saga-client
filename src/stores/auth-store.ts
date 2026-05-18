import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { getRoleFromAccessToken } from "@/lib/auth/token";
import type { AuthState, AuthTokens, AuthUser } from "@/types/auth";

interface AuthStore extends AuthState {
  setAuthTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

const initialState: AuthState = {
  tokens: null,
  role: null,
  user: null,
  isAuthenticated: false,
  hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuthTokens: (tokens) =>
        set({
          tokens,
          role: getRoleFromAccessToken(tokens.accessToken),
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ ...initialState, hasHydrated: true }),
      setHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tokens: state.tokens,
        role: state.role,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
