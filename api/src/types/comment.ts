import type { CommentStatus } from "../constants/statuses.js";
import type { UserSummary } from "./user.js";

/**
 * Một bình luận (`POST /posts/:id/comments`, `PATCH /comments/:id` trả về; phần tử trong `replies`).
 * `content` là chữ thường: frontend hiện dạng text, giữ xuống dòng, không render Markdown hay HTML.
 */
export interface CommentItem {
  id: string;
  postId: string;
  /** `null`: bình luận gốc. Trả lời luôn trỏ về bình luận gốc của nhánh (một cấp) */
  parentId: string | null;
  content: string;
  author: UserSummary;
  /** Người thường chỉ thấy `VISIBLE`; trưởng xóm thấy cả `HIDDEN` (hiện mờ) */
  status: CommentStatus;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601, lần cuối người viết sửa; `null` = chưa sửa (hiện "đã sửa" khi khác `null`) */
  editedAt: string | null;
}

/** `GET /posts/:id/comments`: bình luận gốc, cũ trước mới sau, mỗi cái kèm các trả lời (cũng cũ trước). */
export interface CommentThread extends CommentItem {
  replies: CommentItem[];
}
