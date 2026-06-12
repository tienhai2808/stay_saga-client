"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Paginator } from "@/components/common/paginator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_ORDER, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getErrorMessage } from "@/lib/http/client";
import { formatCurrency } from "@/lib/utils";
import { bookingService } from "@/services/booking.service";
import type { MetaResponse } from "@/types/api";
import type {
  BookingDetail,
  BookingListItem,
  BookingSortField,
  BookingStatus,
  UpdateBookingStatus,
} from "@/types/booking";

interface BookingListPageContentProps {
  title: string;
  description: string;
  action?: ReactNode;
  showRefreshButton?: boolean;
  payNow?: {
    onClick: (bookingId: string) => void;
    label?: string;
  };
  statusUpdate?: {
    nextStatus: UpdateBookingStatus;
    actionLabel: string;
    allowedCurrentStatuses: BookingStatus[];
  };
}

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

function canPayBooking(booking: BookingDetail | null) {
  if (!booking) {
    return false;
  }

  return booking.status === "pending" && !isBookingExpired(booking.expiresAt);
}

function toLabel(text: string) {
  if (!text) {
    return "-";
  }

  return text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();
}

export function BookingListPageContent({
  title,
  description,
  action,
  showRefreshButton = false,
  payNow,
  statusUpdate,
}: BookingListPageContentProps) {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [meta, setMeta] = useState<MetaResponse>(emptyMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [sort, setSort] = useState<BookingSortField>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

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
  }, [order, page, refreshVersion, sort, status]);

  const handleViewBooking = async (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setSelectedBooking(null);
    setDetailError(null);

    try {
      setDetailLoading(true);
      const response = await bookingService.getById(bookingId);
      const detail = response.data.data?.bookings;

      if (!detail) {
        throw new Error("Booking details are unavailable");
      }

      setSelectedBooking(detail);
    } catch (fetchError) {
      setDetailError(getErrorMessage(fetchError, "Unable to load booking details"));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeBookingDialog = () => {
    setSelectedBookingId(null);
    setSelectedBooking(null);
    setDetailError(null);
    setDetailLoading(false);
    setUpdateLoading(false);
  };

  const handleUpdateBookingStatus = async () => {
    if (!selectedBookingId || !selectedBooking || !statusUpdate) {
      return;
    }

    try {
      setUpdateLoading(true);

      const response = await bookingService.updateStatus(selectedBookingId, {
        status: statusUpdate.nextStatus,
      });

      toast.success(response.data.message);

      setSelectedBooking((current) =>
        current
          ? {
              ...current,
              status: statusUpdate.nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      setItems((current) =>
        current.map((item) =>
          item.id === selectedBookingId ? { ...item, status: statusUpdate.nextStatus } : item,
        ),
      );
      setRefreshVersion((current) => current + 1);
    } catch (updateError) {
      toast.error(getErrorMessage(updateError, "Unable to update booking"));
    } finally {
      setUpdateLoading(false);
    }
  };

  const payAllowed = canPayBooking(selectedBooking);
  const payLabel = payAllowed ? payNow?.label ?? "Pay now" : "Payment unavailable";
  const updateAllowed = Boolean(
    statusUpdate &&
      selectedBooking &&
      statusUpdate.allowedCurrentStatuses.includes(selectedBooking.status),
  );

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} action={action} />

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
                setSort(event.target.value as BookingSortField);
                setPage(1);
              }}
            >
              <option value="createdAt">Sort: Created At</option>
              <option value="updatedAt">Sort: Updated At</option>
              <option value="status">Sort: Status</option>
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

            {showRefreshButton ? (
              <Button
                variant="outline"
                onClick={() => {
                  setPage(1);
                  setRefreshVersion((current) => current + 1);
                }}
              >
                Refresh
              </Button>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading ? <p className="text-sm text-muted-foreground">Loading data...</p> : null}
          {!loading && items.length === 0 ? <EmptyState label="No bookings found." /> : null}

          {!loading && items.length > 0 ? (
            <>
              <div className="space-y-3 md:hidden">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full space-y-3 rounded-lg border p-3 text-left"
                    onClick={() => {
                      void handleViewBooking(item.id);
                    }}
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
                        onClick={() => {
                          void handleViewBooking(item.id);
                        }}
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

      <Dialog open={Boolean(selectedBookingId)} onOpenChange={(open) => !open && closeBookingDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Full information for the selected booking.</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <p className="text-sm text-muted-foreground">Loading booking details...</p>
          ) : null}

          {detailError ? <p className="text-sm text-destructive">{detailError}</p> : null}

          {selectedBooking ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 rounded-lg border p-3">
                <p>
                  <span className="font-medium">Status:</span> {bookingStatusLabel[selectedBooking.status]}
                </p>
                <p>
                  <span className="font-medium">Check-in:</span> {formatDate(selectedBooking.checkIn)}
                </p>
                <p>
                  <span className="font-medium">Check-out:</span> {formatDate(selectedBooking.checkOut)}
                </p>
                <p>
                  <span className="font-medium">Room count:</span> {selectedBooking.roomCount}
                </p>
                <p>
                  <span className="font-medium">Guest count:</span> {selectedBooking.guestCount}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> {formatCurrency(selectedBooking.amount)}
                </p>
                <p>
                  <span className="font-medium">Expires at:</span> {formatDateTime(selectedBooking.expiresAt)}
                </p>
                <p>
                  <span className="font-medium">Created at:</span> {formatDateTime(selectedBooking.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Updated at:</span> {formatDateTime(selectedBooking.updatedAt)}
                </p>
              </div>

              <div className="grid gap-2 rounded-lg border p-3">
                <p className="font-medium">Customer</p>
                <p>
                  {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                </p>
                <p>{selectedBooking.user.email || "-"}</p>
                <p>{selectedBooking.user.phone || "-"}</p>
              </div>

              <div className="grid gap-2 rounded-lg border p-3">
                <p className="font-medium">Room Type</p>
                <p>{selectedBooking.roomType.name}</p>
                <p>{selectedBooking.roomType.property.name}</p>
              </div>

              <div className="grid gap-2 rounded-lg border p-3">
                <p className="font-medium">Payments</p>
                {selectedBooking.payments.length === 0 ? (
                  <p className="text-muted-foreground">No payment records yet.</p>
                ) : (
                  selectedBooking.payments.map((payment, index) => (
                    <div key={`${payment.id}-${index}`} className="rounded-md border p-2">
                      <p>
                        <span className="font-medium">Status:</span> {toLabel(payment.status)}
                      </p>
                      <p>
                        <span className="font-medium">Amount:</span> {formatCurrency(payment.amount)}
                      </p>
                      <p>
                        <span className="font-medium">Provider:</span> {payment.provider || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Method:</span> {payment.method || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Paid at:</span> {formatDateTime(payment.paidAt)}
                      </p>
                      <p>
                        <span className="font-medium">Failed at:</span> {formatDateTime(payment.failedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeBookingDialog}>
              Close
            </Button>

            {statusUpdate && updateAllowed ? (
              <Button
                variant={statusUpdate.nextStatus === "cancelled" ? "destructive" : "default"}
                onClick={() => {
                  void handleUpdateBookingStatus();
                }}
                disabled={!selectedBooking || detailLoading || updateLoading}
              >
                {statusUpdate.actionLabel}
              </Button>
            ) : null}

            {payNow ? (
              <Button
                onClick={() => {
                  if (!selectedBooking || !payAllowed) {
                    return;
                  }

                  payNow.onClick(selectedBooking.id);
                }}
                disabled={!selectedBooking || !payAllowed || updateLoading}
              >
                <CreditCard className="h-4 w-4" />
                {payLabel}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
