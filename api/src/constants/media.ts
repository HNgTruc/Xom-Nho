/** Loại file tải lên, trùng enum `MediaKind` trong Prisma. */
export const MEDIA_KINDS = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
} as const;

export type MediaKind = (typeof MEDIA_KINDS)[keyof typeof MEDIA_KINDS];

/**
 * Định dạng nhận (ADR 0005). Backend kiểm tra bằng chữ ký nhị phân, không tin đuôi file hay `Content-Type`;
 * danh sách này chỉ để frontend lọc trước (`accept` của ô chọn file) và hiện câu báo lỗi.
 */
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;
export const MEDIA_MIME_TYPES = [...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES] as const;

export type MediaMimeType = (typeof MEDIA_MIME_TYPES)[number];

/** Cách lưu nội dung bài, trùng enum `ContentFormat` trong Prisma. */
export const CONTENT_FORMATS = {
  /** Bài kiểu diễn đàn: Markdown, render qua component an toàn */
  MARKDOWN: "MARKDOWN",
  /** Bài soạn kiểu mạng xã hội: chữ thường, giữ xuống dòng */
  PLAIN: "PLAIN",
} as const;

export type ContentFormat = (typeof CONTENT_FORMATS)[keyof typeof CONTENT_FORMATS];
