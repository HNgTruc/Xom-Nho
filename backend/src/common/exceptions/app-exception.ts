import { HttpStatus } from "@nestjs/common";
import { ERROR_MESSAGES, type ErrorCode } from "@xom-nho/shared";

/** Mã lỗi → HTTP status. Bảng gốc: docs/api.md. */
export const ERROR_HTTP_STATUS: Record<ErrorCode, HttpStatus> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
};

/**
 * Lỗi nghiệp vụ. Service ném, filter đổi thành `{ error: { code, message, fields? } }`.
 * `message` là câu tiếng Việt người dùng sẽ thấy; bỏ trống thì dùng câu mặc định của mã lỗi.
 */
export class AppException extends Error {
  readonly status: HttpStatus;

  constructor(
    readonly code: ErrorCode,
    message: string = ERROR_MESSAGES[code],
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppException";
    this.status = ERROR_HTTP_STATUS[code];
  }
}
