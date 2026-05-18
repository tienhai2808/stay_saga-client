import { apiClient } from "@/lib/http/client";
import type { ApiEnvelope } from "@/types/api";
import type { CreateBookingData, CreateBookingRequest } from "@/types/booking";

export const bookingService = {
  create(payload: CreateBookingRequest) {
    return apiClient.post<ApiEnvelope<CreateBookingData>>("/bookings", payload);
  },
};
