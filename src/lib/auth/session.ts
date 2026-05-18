import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { clearAuthArtifacts } from "@/lib/auth/storage";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponse } from "@/types/auth-api";

export async function applyAuthResponse(authData: AuthResponse) {
  const store = useAuthStore.getState();
  store.setAuthTokens(authData);

  try {
    const userResponse = await authService.getUserInfo();
    store.setUser(userResponse.data.data);
  } catch {
    store.setUser(null);
  }
}

export async function logoutBestEffort() {
  const { tokens, clearAuth } = useAuthStore.getState();

  try {
    if (tokens?.refreshToken) {
      await authService.logout({ refreshToken: tokens.refreshToken });
    }
  } catch {
    // Swallow error by design (best-effort)
  } finally {
    clearAuth();
    clearAuthArtifacts();
  }
}

export function forceToLoginWithToast(message: string) {
  useAuthStore.getState().clearAuth();
  clearAuthArtifacts();
  toast.error(message);

  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}
