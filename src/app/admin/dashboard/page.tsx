"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, BedDouble, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { propertyService } from "@/services/property.service";
import { roomTypeService } from "@/services/room-type.service";
import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@/lib/constants";
import { getErrorMessage } from "@/lib/http/client";

interface DashboardStats {
  propertyTotal: number;
  roomTypeTotal: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ propertyTotal: 0, roomTypeTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [properties, roomTypes] = await Promise.all([
          propertyService.list({
            page: 1,
            limit: DEFAULT_PAGE_SIZE,
            sort: DEFAULT_SORT,
            order: DEFAULT_ORDER,
          }),
          roomTypeService.list({
            page: 1,
            limit: DEFAULT_PAGE_SIZE,
            sort: DEFAULT_SORT,
            order: DEFAULT_ORDER,
          }),
        ]);

        setStats({
          propertyTotal: properties.data.data?.meta.total ?? 0,
          roomTypeTotal: roomTypes.data.data?.meta.total ?? 0,
        });
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Unable to load overview data"));
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description="Track key metrics and quickly navigate core modules."
      />

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Total properties</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Building2 className="h-6 w-6" />
              {loading ? "..." : stats.propertyTotal}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/properties">
                Manage properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total room types</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <BedDouble className="h-6 w-6" />
              {loading ? "..." : stats.roomTypeTotal}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/room-types">
                Manage room types
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
