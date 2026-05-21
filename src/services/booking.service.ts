import { apiClient } from "@/lib/http/client";
import { toQueryString } from "@/lib/utils";
import type { ApiEnvelope } from "@/types/api";
import type {
  BookingDetailData,
  BookingListData,
  BookingListQuery,
  CreateBookingData,
  CreateBookingRequest,
} from "@/types/booking";

export const bookingService = {
  create(payload: CreateBookingRequest) {
    return apiClient.post<ApiEnvelope<CreateBookingData>>("/bookings", payload);
  },

  list(query: BookingListQuery) {
    const params = toQueryString({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order,
      status: query.status,
    });

    return apiClient.get<ApiEnvelope<BookingListData>>(`/bookings?${params}`);
  },

  getById(id: string) {
    return apiClient.get<ApiEnvelope<BookingDetailData>>(`/bookings/${id}`);
  },
};
