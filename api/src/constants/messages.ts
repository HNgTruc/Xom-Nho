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

/** Ô tạo bài ở trang chủ và hộp soạn bài (docs/tinh-nang.md mục 2.3). */
export const COMPOSER_MESSAGES = {
  DIALOG_TITLE: "Tạo bài viết",
  TITLE_PLACEHOLDER: "Tiêu đề (không bắt buộc)",
  CONTENT_PLACEHOLDER: "Bạn muốn kể gì với xóm?",
  CONTENT_LABEL: "Nội dung",
  CATEGORY_LABEL: "Danh mục",
  CATEGORY_PLACEHOLDER: "Chọn danh mục",
  ADD_MEDIA: "Ảnh/Video",
  MEDIA_HINT: "Ảnh JPG, PNG, WebP đến 5 MB. Video MP4, WebM đến 25 MB. Tối đa 10 file.",
  UPLOADING: "Đang tải lên",
  REMOVE_MEDIA: "Gỡ file này",
  SUBMIT: "Đăng bài",
  PUBLISHED: "Bài của bạn đã lên xóm.",
  DISCARD_CONFIRM: "Bỏ bài đang viết dở?",
  WAIT_UPLOAD: "Chờ ảnh, video tải lên xong rồi đăng nhé.",
  TOO_MANY: "Mỗi bài tối đa 10 ảnh, video.",
  RATE_LIMITED: "Bạn đăng nhiều bài quá, nghỉ tay vài phút rồi đăng tiếp nhé.",
} as const;

/** Sửa, xóa bài của mình (`PATCH`, `DELETE /posts/:id`), dùng chung backend, web, mobile. */
export const POST_MESSAGES = {
  NOT_OWNER: "Bạn chỉ sửa, xóa được bài của mình.",
  ACTIONS: "Tùy chọn bài viết",
  EDIT: "Sửa bài",
  DELETE: "Xóa bài",
  EDIT_TITLE: "Sửa bài viết",
  SAVE: "Lưu thay đổi",
  SAVED: "Đã lưu thay đổi.",
  DISCARD_EDIT_CONFIRM: "Bỏ các thay đổi chưa lưu?",
  LOADING: "Đang mở bài",
  LOAD_FAILED: "Chưa mở được bài để sửa. Bạn thử lại sau nhé.",
  DELETE_TITLE: "Xóa bài viết?",
  DELETE_DESCRIPTION: "Bài cùng bình luận, ảnh và video sẽ bị xóa hẳn, không lấy lại được.",
  DELETE_CONFIRM: "Xóa bài",
  DELETE_CANCEL: "Giữ lại",
} as const;

/** Tải ảnh, video lên (`POST /files`, ADR 0005): backend báo lỗi, frontend kiểm tra trước bằng cùng câu. */
export const FILE_MESSAGES = {
  MISSING: "Chọn một ảnh hoặc video để tải lên.",
  UNSUPPORTED: "File này không phải ảnh JPG, PNG, WebP hay video MP4, WebM.",
  IMAGE_TOO_LARGE: "Ảnh lớn hơn 5 MB. Bạn chọn ảnh nhỏ hơn nhé.",
  VIDEO_TOO_LARGE: "Video lớn hơn 25 MB. Bạn chọn video ngắn hơn nhé.",
  TOO_LARGE: "File lớn quá. Ảnh tối đa 5 MB, video tối đa 25 MB.",
  RATE_LIMITED: "Bạn tải lên nhiều quá, nghỉ tay vài phút rồi thử lại nhé.",
  NOT_FOUND: "Không tìm thấy ảnh, video này.",
  UPLOAD_FAILED: "Chưa tải lên được. Bạn thử lại nhé.",
  /** Ảnh, video gửi kèm bài không còn (đã gắn bài khác, của người khác, hoặc không có) */
  NOT_ATTACHABLE: "Có ảnh, video không dùng được nữa. Bạn gỡ ra rồi thêm lại nhé.",
  /** Chọn video (hay file không phải ảnh) làm ảnh đại diện */
  AVATAR_NOT_IMAGE: "Ảnh đại diện phải là ảnh JPG, PNG hoặc WebP.",
} as const;

/** Bình luận (docs/tinh-nang.md mục 3), dùng chung backend, web, mobile. */
export const COMMENT_MESSAGES = {
  EMPTY: "Viết vài chữ rồi hãy gửi nhé.",
  TOO_LONG: "Bình luận dài quá, bạn rút gọn lại chút nhé.",
  RATE_LIMITED: "Bạn bình luận nhanh quá, nghỉ tay một chút rồi gửi tiếp nhé.",
  NOT_FOUND: "Không tìm thấy bình luận này. Có thể bình luận đã bị xóa.",
  PARENT_GONE: "Bình luận bạn đang trả lời không còn nữa.",
  NOT_OWNER: "Bạn chỉ sửa, xóa được bình luận của mình.",
  /** Bài đã bị trưởng xóm ẩn (chủ bài vẫn mở được trang bài) */
  POST_CLOSED: "Bài này đang ẩn nên không nhận bình luận nữa.",
  /** Trang bài chưa có bình luận (docs/giong-van-va-giao-dien.md) */
  NONE_YET: "Chưa ai lên tiếng. Bạn nói gì đi!",
  HEADING: "Bình luận",
  FORM_LABEL: "Bình luận của bạn",
  SUBMIT: "Gửi bình luận",
  REPLY_SUBMIT: "Gửi trả lời",
  EDITED: "đã sửa",
  DELETE_TITLE: "Xóa bình luận?",
  DELETE_DESCRIPTION: "Bình luận sẽ bị xóa hẳn, không lấy lại được.",
  DELETE_WITH_REPLIES: "Bình luận và các trả lời bên dưới sẽ bị xóa hẳn, không lấy lại được.",
  LOAD_FAILED: "Chưa tải được bình luận. Bạn thử lại nhé.",
} as const;

/** Thích bài (docs/tinh-nang.md mục 2.6), dùng chung backend, web, mobile. */
export const LIKE_MESSAGES = {
  LIKE: "Thích",
  RATE_LIMITED: "Bạn bấm nhanh quá, nghỉ tay một chút rồi thử lại nhé.",
  /** Bài chưa đăng hoặc đã bị trưởng xóm ẩn (chủ bài vẫn mở được trang bài) */
  POST_CLOSED: "Bài này đang ẩn nên chưa thích được.",
  FAILED: "Chưa lưu được lượt thích. Bạn thử lại nhé.",
} as const;

/**
 * Không thích bài (ADR 0009, docs/tinh-nang.md mục 2.6). Thích và Không thích loại trừ nhau. Dùng chung
 * backend, web, mobile; giới hạn tần suất dùng chung câu `LIKE_MESSAGES.RATE_LIMITED`.
 */
export const DISLIKE_MESSAGES = {
  DISLIKE: "Không thích",
  POST_CLOSED: "Bài này đang ẩn nên chưa bấm Không thích được.",
  FAILED: "Chưa lưu được lượt không thích. Bạn thử lại nhé.",
} as const;

/** Chia sẻ bài (docs/tinh-nang.md mục 2.6): điện thoại mở bảng chia sẻ, máy tính sao chép liên kết. */
export const SHARE_MESSAGES = {
  SHARE: "Chia sẻ",
  COPIED: "Đã sao chép liên kết",
  COPY_FAILED: "Chưa sao chép được liên kết. Bạn thử lại nhé.",
} as const;

/** Số thích cho trình đọc màn hình và nhãn: "12 lượt thích". */
export function likeCountLabel(count: number): string {
  return `${count.toLocaleString("vi-VN")} lượt thích`;
}

/** Số không thích cho trình đọc màn hình và nhãn: "2 lượt không thích". */
export function dislikeCountLabel(count: number): string {
  return `${count.toLocaleString("vi-VN")} lượt không thích`;
}

/** Số bình luận trên thẻ bài: "3 bình luận". */
export function commentCountLabel(count: number): string {
  return `${count.toLocaleString("vi-VN")} bình luận`;
}

/** Nhãn ô trả lời: "Trả lời Lan Anh". */
export function commentReplyLabel(name: string): string {
  return `Trả lời ${name}`;
}

/** Lời mời viết bài trên trang chủ, theo tên người đang xem. */
export function composerPrompt(name: string): string {
  return `Chào ${name}, hôm nay có chuyện gì?`;
}

/** Ô tìm ở header và trang `/tim-kiem` (docs/tinh-nang.md mục 2.5). */
export const SEARCH_MESSAGES = {
  TITLE: "Tìm kiếm",
  PLACEHOLDER: "Tìm trong xóm",
  INPUT_LABEL: "Tìm bài viết",
  OPEN: "Mở ô tìm kiếm",
  CLOSE: "Đóng ô tìm kiếm",
  PROMPT: "Gõ từ khóa vào ô tìm ở trên nhé. Có dấu hay không dấu đều được.",
  ALL_CATEGORIES: "Tất cả",
  LOAD_ERROR: "Có trục trặc khi tìm. Bạn thử lại sau ít phút nhé.",
} as const;

/** Câu mẫu "Tìm không ra" ở docs/giong-van-va-giao-dien.md. */
export function searchEmptyMessage(q: string): string {
  return `Không thấy bài nào khớp "${q}". Thử từ khác xem sao.`;
}

/** Câu của trang cài đặt tài khoản (docs/tinh-nang.md mục 1.4). */
export const SETTINGS_MESSAGES = {
  SAVED: "Đã lưu hồ sơ của bạn.",
  NO_CHANGE: "Bạn chưa thay đổi gì.",
  AVATAR_SAVED: "Đã đổi ảnh đại diện.",
  AVATAR_REMOVED: "Đã xóa ảnh đại diện.",
  AVATAR_HINT: "Ảnh JPG, PNG hoặc WebP, tối đa 5 MB. Hàng xóm sẽ thấy ảnh này cạnh tên bạn.",
  AVATAR_REMOVE_TITLE: "Xóa ảnh đại diện?",
  AVATAR_REMOVE_DESCRIPTION:
    "Ảnh sẽ bị xóa hẳn, chỗ ảnh hiện chữ cái đầu tên bạn. Muốn có ảnh lại thì bạn tải ảnh khác lên.",
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

/**
 * Bài đang ẩn, câu cho tác giả: trưởng xóm ẩn thì có lý do (`PostDetail.rejectReason`), theo câu mẫu ở
 * docs/giong-van-va-giao-dien.md; không có lý do thì dùng câu chung `POST_STATUS_NOTES.ARCHIVED`.
 */
export function archivedNote(reason: string | null): string {
  return reason ? `Trưởng xóm đã ẩn bài này. Lý do: ${reason}` : POST_STATUS_NOTES.ARCHIVED;
}

/**
 * Lý do chọn nhanh khi trưởng xóm ẩn bài (pages/admin.md mục "Ẩn bài"). Chọn "Lý do khác" thì tự ghi;
 * backend chỉ nhận chuỗi `reason`, không giới hạn trong danh sách này.
 */
export const POST_HIDE_REASONS = [
  "Quảng cáo, rao vặt",
  "Lời lẽ xúc phạm",
  "Lộ thông tin cá nhân",
] as const;

/** Trang quản trị (`/api/v1/admin/*`): ngắn gọn, trung tính (giong-van-va-giao-dien.md, mục admin). */
export const ADMIN_MESSAGES = {
  HIDE_REASON_REQUIRED: "Ghi lý do ẩn bài.",
  HIDE_REASON_TOO_LONG: "Lý do tối đa 500 ký tự.",
  POST_NOT_PUBLISHED: "Chỉ ẩn được bài đang hiện trên xóm.",
  POST_NOT_HIDDEN: "Bài này không ở trạng thái ẩn.",
  POST_NOT_FOUND: "Không tìm thấy bài viết này.",
  COMMENT_NOT_FOUND: "Không tìm thấy bình luận này.",
  USER_NOT_FOUND: "Không tìm thấy thành viên này.",
  CANNOT_CHANGE_OWN_ROLE: "Không đổi được vai trò của chính mình.",
  CANNOT_BAN_SELF: "Không cấm được chính mình.",
  CANNOT_BAN_ADMIN: "Không cấm được trưởng xóm. Đổi vai trò người này trước.",
  BAN_REASON_REQUIRED: "Ghi lý do cấm.",
  BAN_REASON_TOO_LONG: "Lý do tối đa 500 ký tự.",
  BAN_EXPIRES_INVALID: "Thời hạn cấm không hợp lệ.",
  BAN_EXPIRES_PAST: "Thời hạn cấm phải sau thời điểm hiện tại.",
  SINCE_INVALID: "Mốc thời gian không hợp lệ.",
} as const;
