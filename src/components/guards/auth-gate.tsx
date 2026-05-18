"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getHomeByRole } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LoadingScreen } from "@/components/common/loading-screen";
import type { AuthRole } from "@/types/auth";

interface AuthGateProps {
  children: React.ReactNode;
  requiredRole?: AuthRole;
}

export function AuthGate({ children, requiredRole }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const hasHandledRoleError = useRef(false);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!requiredRole) {
      return;
    }

    const activeRole = role ?? "user";
    if (activeRole !== requiredRole) {
      if (!hasHandledRoleError.current) {
        toast.error("You do not have permission to access this page.");
        hasHandledRoleError.current = true;
      }

      router.replace(getHomeByRole(activeRole));
    }
  }, [hasHydrated, isAuthenticated, requiredRole, role, router, pathname]);

  if (!hasHydrated) {
    return <LoadingScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen label="Redirecting to sign-in..." />;
  }

  if (requiredRole && (role ?? "user") !== requiredRole) {
    return <LoadingScreen label="Redirecting based on your access level..." />;
  }

  return <>{children}</>;
}
