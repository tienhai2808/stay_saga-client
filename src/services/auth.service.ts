import { apiClient } from "@/lib/http/client";
import type { ApiEnvelope } from "@/types/api";
import type {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  UserInfoResponse,
} from "@/types/auth-api";

export const authService = {
  login(payload: LoginRequest) {
    return apiClient.post<ApiEnvelope<AuthResponse>>("/auth/login", payload);
  },

  register(payload: RegisterRequest) {
    return apiClient.post<ApiEnvelope<AuthResponse>>("/auth/register", payload);
  },

  refresh(payload: RefreshTokenRequest) {
    return apiClient.post<ApiEnvelope<AuthResponse>>("/auth/refresh-token", payload);
  },

  logout(payload: LogoutRequest) {
    return apiClient.post<ApiEnvelope<null>>("/auth/logout", payload);
  },

  getUserInfo() {
    return apiClient.get<ApiEnvelope<UserInfoResponse>>("/auth/userinfo");
  },
};
