import type { MetaResponse, PaginationQuery } from "@/types/api";

export interface PropertyRequest {
  name: string;
  address: string;
  ward: string;
  city: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
}

export type UpdatePropertyRequest = PropertyRequest;

export interface PropertyResponse {
  id: string;
  name: string;
  address: string;
  ward: string;
  city: string;
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
}

export interface PropertyListData {
  properties: PropertyResponse[];
  meta: MetaResponse;
}

export interface PropertyListQuery extends PaginationQuery {
  search?: string;
}

export interface PropertyRoomTypesData {
  roomTypes: BasicRoomTypeResponse[];
  meta: MetaResponse;
  property?: PropertyResponse;
}

export interface RoomTypeRequest {
  name: string;
  propertyId: string;
  price: number;
  maxGuest: number;
  totalRoom: number;
}

export type UpdateRoomTypeRequest = RoomTypeRequest;

export interface BasicPropertyResponse {
  id: string;
  name: string;
  address: string;
  ward: string;
  city: string;
}

export interface RoomTypeResponse {
  id: string;
  name: string;
  price: number;
  maxGuest: number;
  totalRoom: number;
  property: BasicPropertyResponse;
}

export interface BasicRoomTypeResponse {
  id: string;
  name: string;
  price: number;
  maxGuest: number;
  totalRoom: number;
}

export interface RoomTypeListData {
  roomTypes: RoomTypeResponse[];
  meta: MetaResponse;
}

export interface RoomTypeListQuery extends PaginationQuery {
  search?: string;
  propertyId?: string;
}

export interface RoomTypeByPropertyQuery extends PaginationQuery {
  search?: string;
  include?: "property";
}
