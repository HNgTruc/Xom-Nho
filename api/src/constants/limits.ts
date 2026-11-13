/** Giới hạn dùng chung cho schema Zod (frontend + backend) và cột trong database. */
export const LIMITS = {
  PAGE_SIZE_DEFAULT: 10,
  PAGE_SIZE_MAX: 50,
  ADMIN_PAGE_SIZE_MAX: 100,
  ADMIN_PAGE_SIZE_DEFAULT: 20,
  /** Lý do ẩn bài, cấm thành viên: cột `post.rejectReason`, `user.banReason` (VARCHAR 500) */
  MODERATION_REASON_MAX: 500,

  PASSWORD_MIN: 8,
  /** Better Auth mặc định từ chối mật khẩu dài hơn 128 */
  PASSWORD_MAX: 128,
  USER_NAME_MIN: 2,
  USER_NAME_MAX: 50,
  USER_BIO_MAX: 500,
  /** Username tự sinh từ tên: chỉ a-z, 0-9 */
  USERNAME_MAX: 20,
  URL_MAX: 500,

  POST_TITLE_MIN: 5,
  POST_TITLE_MAX: 200,
  SLUG_MAX: 220,
  POST_EXCERPT_MAX: 160,
  POST_TAGS_MAX: 5,
  /** Nội dung bài soạn kiểu mạng xã hội (chữ thường) */
  POST_PLAIN_CONTENT_MAX: 10_000,
  /** Số ảnh, video tối đa mỗi bài */
  POST_MEDIA_MAX: 10,

  /** Ảnh tải lên: 5 MB (ADR 0005) */
  IMAGE_MAX_BYTES: 5 * 1024 * 1024,
  /** Video tải lên: 25 MB (ADR 0005) */
  VIDEO_MAX_BYTES: 25 * 1024 * 1024,

  /** Độ dài một bình luận (chữ thường) */
  COMMENT_MAX: 2000,
  /** Số bình luận xem trước trên mỗi thẻ bài trong danh sách */
  FEED_LATEST_COMMENTS: 2,

  CATEGORY_NAME_MAX: 50,
  TAG_NAME_MAX: 30,
  /** Số tag gợi ý tối đa khi gõ (`GET /tags?q=`) */
  TAG_SUGGEST_MAX: 10,

  SEARCH_QUERY_MAX: 100,
} as const;
