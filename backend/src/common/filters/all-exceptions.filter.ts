import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { type ApiErrorBody, ERROR_CODES, ERROR_MESSAGES, type ErrorCode } from "@xom-nho/shared";
import type { Response } from "express";
import { AppException } from "../exceptions/app-exception.js";

/** HTTP status từ lỗi của Nest/Express (route không có, JSON hỏng...) → mã lỗi của Xóm Nhỏ. */
const STATUS_TO_CODE: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.VALIDATION_ERROR,
  [HttpStatus.UNAUTHORIZED]: ERROR_CODES.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ERROR_CODES.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_CODES.CONFLICT,
  [HttpStatus.TOO_MANY_REQUESTS]: ERROR_CODES.RATE_LIMITED,
};

/**
 * Đổi mọi lỗi thành `{ error: { code, message, fields? } }` theo docs/api.md.
 * Lỗi không lường trước chỉ ghi log; người dùng nhận câu chung, không thấy stack trace hay lỗi Prisma.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toErrorBody(exception);
    response.status(status).json(body);
  }

  toErrorBody(exception: unknown): { status: number; body: ApiErrorBody } {
    if (exception instanceof AppException) {
      return {
        status: exception.status,
        body: {
          error: {
            code: exception.code,
            message: exception.message,
            ...(exception.fields && { fields: exception.fields }),
          },
        },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = STATUS_TO_CODE[status];
      if (code) {
        // Câu của Nest là tiếng Anh: thay bằng câu tiếng Việt mặc định của mã lỗi
        return { status, body: { error: { code, message: ERROR_MESSAGES[code] } } };
      }
      if (status < 500) {
        return {
          status,
          body: {
            error: { code: ERROR_CODES.VALIDATION_ERROR, message: ERROR_MESSAGES.VALIDATION_ERROR },
          },
        };
      }
    }

    this.logger.error(
      exception instanceof Error ? (exception.stack ?? exception.message) : exception,
    );
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: ERROR_CODES.INTERNAL_ERROR, message: ERROR_MESSAGES.INTERNAL_ERROR } },
    };
  }
}
