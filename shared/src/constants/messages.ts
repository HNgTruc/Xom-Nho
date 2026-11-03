import type { ErrorCode } from "./error-codes.js";

/**
 * Câu báo lỗi mặc định theo mã lỗi, khi backend không có câu cụ thể hơn.
 * Giọng văn theo docs/giong-van-va-giao-dien.md: nói chuyện gì xảy ra và làm gì tiếp.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Thông tin chưa hợp lệ. Bạn xem lại các ô được đánh dấu nhé.",
  UNAUTHORIZED: "Bạn cần đăng nhập để làm việc này.",
  FORBIDDEN: "Bạn không có quyền làm việc này.",
  NOT_FOUND: "Lạc đường rồi. Trang này không có trong xóm.",
  CONFLICT: "Đã có nội dung trùng. Bạn thử tên khác xem sao.",
  RATE_LIMITED: "Từ từ thôi bạn ơi, chờ vài giây rồi gửi tiếp.",
  INTERNAL_ERROR: "Có trục trặc bên mình. Bạn thử lại sau ít phút nhé.",
};
