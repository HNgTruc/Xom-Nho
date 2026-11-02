import type { ErrorCode } from "../constants/error-codes.js";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    /** Lỗi theo từng trường của form, chỉ có khi code là VALIDATION_ERROR. */
    fields?: Record<string, string>;
  };
}
