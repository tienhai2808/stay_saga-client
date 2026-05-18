import { jwtDecode } from "jwt-decode";
import type { AuthRole } from "@/types/auth";

interface JwtRolePayload {
  realm_access?: {
    roles?: string[];
  };
}

export function getRoleFromAccessToken(accessToken: string): AuthRole {
  try {
    const payload = jwtDecode<JwtRolePayload>(accessToken);
    const roles = payload.realm_access?.roles ?? [];

    return roles.includes("admin") ? "admin" : "user";
  } catch {
    return "user";
  }
}
