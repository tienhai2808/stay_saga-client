import { apiClient } from "@/lib/http/client";
import { toQueryString } from "@/lib/utils";
import type { ApiEnvelope } from "@/types/api";
import type {
  PropertyListData,
  PropertyListQuery,
  PropertyRequest,
  PropertyResponse,
  PropertyRoomTypesData,
  RoomTypeByPropertyQuery,
} from "@/types/property";

export const propertyService = {
  create(payload: PropertyRequest) {
    return apiClient.post<ApiEnvelope<{ id: string }>>("/properties", payload);
  },

  update(id: string, payload: PropertyRequest) {
    return apiClient.put<ApiEnvelope<null>>(`/properties/${id}`, payload);
  },

  remove(id: string) {
    return apiClient.delete<ApiEnvelope<null>>(`/properties/${id}`);
  },

  list(query: PropertyListQuery) {
    const params = toQueryString({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sort: query.sort,
      order: query.order,
    });

    return apiClient.get<ApiEnvelope<PropertyListData>>(`/properties?${params}`);
  },

  listRoomTypesByProperty(id: string, query: RoomTypeByPropertyQuery) {
    const params = toQueryString({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sort: query.sort,
      order: query.order,
      include: query.include,
    });

    return apiClient.get<ApiEnvelope<PropertyRoomTypesData>>(
      `/properties/${id}/room-types?${params}`,
    );
  },

  getByIdFromList(data: PropertyResponse[], id: string) {
    return data.find((property) => property.id === id) ?? null;
  },
};
