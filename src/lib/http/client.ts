import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/types/api";
import type { AuthResponse } from "@/types/auth-api";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isInterceptorsSetup = false;
let refreshPromise: Promise<string> | null = null;
let hasShownSessionExpired = false;

function getRefreshToken() {
  return useAuthStore.getState().tokens?.refreshToken;
}

function handleSessionExpired() {
  const { clearAuth } = useAuthStore.getState();
  clearAuth();

  if (typeof window !== "undefined") {
    if (!hasShownSessionExpired) {
      toast.error("Your session has expired. Please sign in again.");
      hasShownSessionExpired = true;
      window.setTimeout(() => {
        hasShownSessionExpired = false;
      }, 1500);
    }

    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await authClient.post<ApiEnvelope<AuthResponse>>(
    "/auth/refresh-token",
    { refreshToken },
  );

  const payload = response.data.data;
  if (!payload) {
    throw new Error("Invalid refresh response");
  }

  useAuthStore.getState().setAuthTokens(payload);

  return payload.accessToken;
}

export function setupApiInterceptors() {
  if (isInterceptorsSetup) {
    return;
  }

  isInterceptorsSetup = true;

  apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().tokens?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiErrorEnvelope>) => {
      const status = error.response?.status;
      const originalRequest = error.config as RetryRequestConfig | undefined;

      if (!originalRequest || status !== 401) {
        return Promise.reject(error);
      }

      const url = originalRequest.url ?? "";
      const isAuthRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh-token");

      if (originalRequest._retry || isAuthRoute) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    },
  );
}

export function getErrorMessage(error: unknown, fallback = "An unknown error occurred") {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export { apiClient, authClient };
