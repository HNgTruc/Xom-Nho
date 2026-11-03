import type { ErrorCode } from "../constants/error-codes.js";
import type { ApiErrorBody } from "../types/api-response.js";

/** Lỗi mà api-client ném ra khi backend trả `{ error }` hoặc không gọi được backend. */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields: Record<string, string> | undefined;

  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
