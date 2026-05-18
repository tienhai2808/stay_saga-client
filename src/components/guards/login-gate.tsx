"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearAuthArtifacts } from "@/lib/auth/storage";
import { getHomeByRole } from "@/lib/navigation";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useAuthStore } from "@/stores/auth-store";

export function LoginGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const cleaned = useRef(false);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (isAuthenticated) {
      router.replace(getHomeByRole(role ?? "user"));
      return;
    }

    if (!cleaned.current) {
      clearAuthArtifacts();
      cleaned.current = true;
    }
  }, [hasHydrated, isAuthenticated, role, router]);

  if (!hasHydrated) {
    return <LoadingScreen label="Checking authentication status..." />;
  }

  if (isAuthenticated) {
    return <LoadingScreen label="Redirecting..." />;
  }

  return <>{children}</>;
}
