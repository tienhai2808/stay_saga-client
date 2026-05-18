"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { LoadingScreen } from "@/components/common/loading-screen";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { getErrorMessage } from "@/lib/http/client";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getUserInfo();
        setUser(response.data.data);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Unable to load profile information"));
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [setUser]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Profile"
        description="Currently signed-in account information (read-only)."
      />

      {loading ? <LoadingScreen label="Loading profile..." /> : null}

      {!loading && error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && user ? (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <p>
              <span className="font-medium">ID:</span> {user.id}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Full name:</span> {user.firstName} {user.lastName}
            </p>
            <p>
              <span className="font-medium">Phone number:</span> {user.phone}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
