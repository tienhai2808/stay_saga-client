export const AUTH_STORAGE_KEY = "stay_saga_auth";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5122";

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT = "name";
export const DEFAULT_ORDER = "asc" as const;
