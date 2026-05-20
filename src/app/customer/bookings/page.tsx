"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Paginator } from "@/components/common/paginator";
import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getErrorMessage } from "@/lib/http/client";
import { formatCurrency } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import type { MetaResponse } from "@/types/api";
import type { BookingResponse, BookingStatus } from "@/types/booking";

const emptyMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  totalPage: 0,
  hasPrev: false,
  hasNext: false,
};

const bookingStatusLabel: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const bookingStatusVariant: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "outline",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("vi-VN");
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("vi-VN");
}

function isBookingExpired(expiresAt: string | null) {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}

export default function CustomerBookingsPage() {
  const router = useRouter();
  const [items, setItems] = useState<BookingResponse[]>([]);
  const [meta, setMeta] = useState<MetaResponse>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [sort, setSort] = useState<"id" | "createdAt" | "updatedAt" | "status">("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await bookingService.list({
          page,
          limit: DEFAULT_PAGE_SIZE,
          status,
          sort,
          order,
        });

        setItems(response.data.data?.bookings ?? []);
        setMeta(response.data.data?.meta ?? emptyMeta);
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, "Unable to load booking list"));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [order, page, sort, status]);

  const handlePayNow = (bookingId: string) => {
    router.push(`/customer/payment?bookingId=${bookingId}`);
  };

  const canPaySelected =
    selectedBooking?.status === "pending" && !isBookingExpired(selectedBooking.expiresAt);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Review your bookings and continue payment for pending items."
        action={
          <Button variant="outline" onClick={() => router.push("/customer/room-types")}>
            Create Booking
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-[210px_180px_170px_auto]">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as BookingStatus | "");
                setPage(1);
              }}
            >
              <option value="">Status: All</option>
              <option value="pending">Status: Pending</option>
              <option value="confirmed">Status: Confirmed</option>
              <option value="cancelled">Status: Cancelled</option>
              <option value="completed">Status: Completed</option>
            </Select>

            <Select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as "id" | "createdAt" | "updatedAt" | "status");
                setPage(1);
              }}
            >
              <option value="createdAt">Sort: Created At</option>
              <option value="updatedAt">Sort: Updated At</option>
              <option value="status">Sort: Status</option>
              <option value="id">Sort: ID</option>
            </Select>

            <Select
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as "asc" | "desc");
                setPage(1);
              }}
            >
              <option value="asc">Order: Asc</option>
              <option value="desc">Order: Desc</option>
            </Select>

            <Button variant="outline" onClick={() => setPage(1)}>
              Refresh
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading ? <p className="text-sm text-muted-foreground">Loading data...</p> : null}
          {!loading && items.length === 0 ? <EmptyState label="No bookings found." /> : null}

          {!loading && items.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="w-full space-y-3 rounded-lg border p-3 text-left"
                    onClick={() => setSelectedBooking(item)}
                  >
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Room count: {item.roomCount}</p>
                      <p>Amount: {formatCurrency(item.amount)}</p>
                    </div>
                    <Badge variant={bookingStatusVariant[item.status]}>
                      {bookingStatusLabel[item.status]}
                    </Badge>
                  </button>
                ))}
              </div>

              <div className="hidden md:block">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check-in / Check-out</TableHead>
                      <TableHead>Room Count</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedBooking(item)}
                      >
                        <TableCell>
                          {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
                        </TableCell>
                        <TableCell>{item.roomCount}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={bookingStatusVariant[item.status]}>
                            {bookingStatusLabel[item.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Paginator meta={meta} onPageChange={(nextPage) => setPage(nextPage)} />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Full information for booking {selectedBooking?.id ?? ""}.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="space-y-2 text-sm">
              <p>Booking ID: {selectedBooking.id}</p>
              <p>User ID: {selectedBooking.keycloakId}</p>
              <p>Room Type ID: {selectedBooking.roomTypeId}</p>
              <p>Check-in: {formatDate(selectedBooking.checkIn)}</p>
              <p>Check-out: {formatDate(selectedBooking.checkOut)}</p>
              <p>Room count: {selectedBooking.roomCount}</p>
              <p>Guest count: {selectedBooking.guestCount}</p>
              <p>Amount: {formatCurrency(selectedBooking.amount)}</p>
              <p>Status: {bookingStatusLabel[selectedBooking.status]}</p>
              <p>Expires at: {formatDateTime(selectedBooking.expiresAt)}</p>
              <p>Created at: {formatDateTime(selectedBooking.createdAt)}</p>
              <p>Updated at: {formatDateTime(selectedBooking.updatedAt)}</p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
            <Button
              onClick={() => selectedBooking && handlePayNow(selectedBooking.id)}
              disabled={!selectedBooking || !canPaySelected}
            >
              <CreditCard className="h-4 w-4" />
              {canPaySelected ? "Pay now" : "Payment unavailable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
