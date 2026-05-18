"use client";

import { AuthGate } from "@/components/guards/auth-gate";
import { AppShell } from "@/components/layout/app-shell";
import { adminNavItems } from "@/lib/navigation";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate requiredRole="admin">
      <AppShell title="Admin Dashboard" navItems={adminNavItems}>
        {children}
      </AppShell>
    </AuthGate>
  );
}
