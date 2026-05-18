export interface ApiEnvelope<T> {
  message: string;
  code: string;
  data: T | null;
}

export interface ApiErrorEnvelope {
  message: string;
  code: string;
  data: unknown;
}

export interface MetaResponse {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}
