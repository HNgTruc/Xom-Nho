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

/** Câu của danh sách bài (trang chủ, danh mục, tag), dùng chung cho web và app. */
export const FEED_MESSAGES = {
  EMPTY: "Xóm còn vắng quá. Bạn mở hàng bài đầu tiên nhé?",
  PAGE_EMPTY: "Trang này chưa có bài nào. Bạn quay về trang đầu xem sao.",
  CATEGORY_EMPTY: "Danh mục này chưa có bài nào. Bạn mở hàng bài đầu tiên nhé?",
  TAG_EMPTY: "Chưa có bài nào gắn thẻ này.",
  PROFILE_EMPTY: "Hàng xóm này chưa đăng bài nào.",
  LOAD_ERROR: "Chưa tải được bài viết. Bạn thử lại sau ít phút nhé.",
} as const;

/** Bảng Thông báo ở header (docs/tinh-nang.md mục 6). */
export const NOTIFICATION_MESSAGES = {
  TITLE: "Thông báo",
  EMPTY:
    "Chưa có thông báo nào. Khi có người bình luận, thích bài hay mời kết bạn, bạn sẽ thấy ở đây.",
} as const;

/** Bảng Tin nhắn ở header (docs/tinh-nang.md mục 5). */
export const INBOX_MESSAGES = {
  TITLE: "Tin nhắn",
  EMPTY: "Bạn chưa có tin nhắn nào. Ghé hồ sơ một hàng xóm để bắt chuyện nhé.",
} as const;

/**
 * Trang chào mừng: thứ duy nhất khách thấy (ADR 0007, docs/tinh-nang.md mục 2.0).
 * Mỗi điểm trong `POINTS` là một tấm nhỏ: tiêu đề và một câu.
 */
export const WELCOME_MESSAGES = {
  EYEBROW: "Diễn đàn nhỏ của hàng xóm",
  TITLE: "Chào mừng đến Xóm Nhỏ",
  INTRO:
    "Nơi hàng xóm kể chuyện thường ngày, hỏi han nhau và chia sẻ điều mình biết. Đăng ký để vào xóm đọc bài và cùng trò chuyện.",
  JOIN: "Tham gia xóm",
  SIGN_IN: "Đăng nhập",
  POINTS: [
    {
      TITLE: "Đọc chuyện trong xóm",
      TEXT: "Bài của hàng xóm theo danh mục: đời sống, công nghệ, học tập, kể chuyện, hỏi đáp.",
    },
    {
      TITLE: "Viết bài của bạn",
      TEXT: "Hàng xóm mới gửi bài để trưởng xóm duyệt, cây bút thì đăng thẳng.",
    },
    {
      TITLE: "Cùng trò chuyện",
      TEXT: "Bình luận dưới bài, ghé hồ sơ của nhau. Chỉ người trong xóm mới đọc được.",
    },
  ],
} as const;

/** Câu của trang cài đặt tài khoản (docs/tinh-nang.md mục 1.4). */
export const SETTINGS_MESSAGES = {
  SAVED: "Đã lưu hồ sơ của bạn.",
  NO_CHANGE: "Bạn chưa thay đổi gì.",
} as const;

/**
 * Câu hiện trên trang bài khi bài chưa đăng (chỉ tác giả và trưởng xóm thấy trang này).
 * Bài bị từ chối: `rejectedNote(lý do)`, theo câu mẫu ở docs/giong-van-va-giao-dien.md.
 */
export const POST_STATUS_NOTES = {
  DRAFT: "Đây là bản nháp, bài chưa lên xóm.",
  PENDING: "Bài đang chờ trưởng xóm duyệt. Duyệt xong hàng xóm mới thấy.",
  ARCHIVED: "Bài đã bị ẩn khỏi xóm. Hàng xóm khác không thấy bài này.",
} as const;

export function rejectedNote(reason: string | null): string {
  return reason ? `Bài chưa được duyệt. Lý do: ${reason}` : "Bài chưa được duyệt.";
}
