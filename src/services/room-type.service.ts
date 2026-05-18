import { apiClient } from "@/lib/http/client";
import { toQueryString } from "@/lib/utils";
import type { ApiEnvelope } from "@/types/api";
import type {
  RoomTypeListData,
  RoomTypeListQuery,
  RoomTypeRequest,
} from "@/types/property";

export const roomTypeService = {
  create(payload: RoomTypeRequest) {
    return apiClient.post<ApiEnvelope<{ id: string }>>("/room-types", payload);
  },

  update(id: string, payload: RoomTypeRequest) {
    return apiClient.put<ApiEnvelope<null>>(`/room-types/${id}`, payload);
  },

  remove(id: string) {
    return apiClient.delete<ApiEnvelope<null>>(`/room-types/${id}`);
  },

  list(query: RoomTypeListQuery) {
    const params = toQueryString({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sort: query.sort,
      order: query.order,
      propertyId: query.propertyId,
    });

    return apiClient.get<ApiEnvelope<RoomTypeListData>>(`/room-types?${params}`);
  },
};
