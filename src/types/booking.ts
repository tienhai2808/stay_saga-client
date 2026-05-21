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
export type BookingSortField = "id" | "createdAt" | "updatedAt" | "status";

export interface BookingListItem {
  id: string;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  status: BookingStatus;
  amount: number;
}

export interface BookingDetailUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingDetailProperty {
  id: string;
  name: string;
}

export interface BookingDetailRoomType {
  id: string;
  property: BookingDetailProperty;
  name: string;
}

export interface BookingDetailPayment {
  id: string;
  amount: number;
  provider: string | null;
  method: string | null;
  status: string;
  paidAt: string | null;
  failedAt: string | null;
}

export interface BookingDetail {
  id: string;
  user: BookingDetailUser;
  roomType: BookingDetailRoomType;
  payments: BookingDetailPayment[];
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
  bookings: BookingListItem[];
  meta: MetaResponse;
}

export interface BookingDetailData {
  bookings: BookingDetail;
}

export interface BookingListQuery extends PaginationQuery {
  sort?: BookingSortField;
  status?: BookingStatus | "";
}
