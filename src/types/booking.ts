import type { MetaResponse, PaginationQuery } from "@/types/api";

export interface CreateBookingRequest {
  roomTypeId: string;
  roomCount: number;
  guestCount: number;
  checkIn: string;
  checkOut: string;
}

export interface CreateBookingData {
  id: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface BookingResponse {
  id: string;
  keycloakId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  guestCount: number;
  status: BookingStatus;
  amount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingListData {
  bookings: BookingResponse[];
  meta: MetaResponse;
}

export interface BookingListQuery extends PaginationQuery {
  sort?: "id" | "createdAt" | "updatedAt" | "status";
  status?: BookingStatus | "";
}
