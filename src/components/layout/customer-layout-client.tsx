"use client";

import { AuthGate } from "@/components/guards/auth-gate";
import { AppShell } from "@/components/layout/app-shell";
import { customerNavItems } from "@/lib/navigation";

export function CustomerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate requiredRole="user">
      <AppShell title="Customer Area" navItems={customerNavItems}>
        {children}
      </AppShell>
    </AuthGate>
  );
}
