"use client";

import { BookingListPageContent } from "@/components/bookings/booking-list-page-content";

export default function AdminBookingsPage() {
  return (
    <BookingListPageContent
      title="Booking Management"
      description="Review all bookings across users with filter, sort, and pagination."
    />
  );
}
