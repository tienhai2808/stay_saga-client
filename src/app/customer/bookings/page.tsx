"use client";

import { useRouter } from "next/navigation";
import { BookingListPageContent } from "@/components/bookings/booking-list-page-content";
import { Button } from "@/components/ui/button";

export default function CustomerBookingsPage() {
  const router = useRouter();

  return (
    <BookingListPageContent
      title="My Bookings"
      description="Review your bookings and continue payment for pending items."
      statusUpdate={{
        nextStatus: "cancelled",
        actionLabel: "Cancel booking",
        allowedCurrentStatuses: ["pending"],
      }}
      action={
        <Button variant="outline" onClick={() => router.push("/customer/room-types")}>
          Create Booking
        </Button>
      }
      showRefreshButton
      payNow={{
        onClick: (bookingId) => {
          router.push(`/customer/payment?bookingId=${bookingId}`);
        },
      }}
    />
  );
}
