"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { setupApiInterceptors } from "@/lib/http/client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupApiInterceptors();
  }, []);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
