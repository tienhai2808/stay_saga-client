export type AuthRole = "admin" | "user";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthState {
  tokens: AuthTokens | null;
  role: AuthRole | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
}
