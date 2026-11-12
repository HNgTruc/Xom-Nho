import { ERROR_MESSAGES } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";

/** Câu báo lỗi tiếng Việt từ backend (ưu tiên lỗi của ô nội dung, ô trả lời), không lộ chi tiết kỹ thuật. */
export function commentErrorText(error: unknown): string {
  if (!isApiError(error)) return ERROR_MESSAGES.INTERNAL_ERROR;
  return error.fields?.content ?? error.fields?.parentId ?? error.message;
}
