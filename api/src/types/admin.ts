import type { Role } from "../constants/roles.js";
import type { CommentStatus, PostStatus } from "../constants/statuses.js";
import type { CategoryRef } from "./post.js";
import type { UserSummary } from "./user.js";

/**
 * Một bài trong bảng quản trị (`GET /admin/posts`), mọi trạng thái. Không có `content` để bảng nhẹ;
 * xem đủ nội dung bằng `GET /posts/:slug` (trưởng xóm mở được cả bài đang ẩn).
 */
export interface AdminPostListItem {
  id: string;
  /** Rỗng với bài không đặt tiêu đề: hiện `excerpt` thay */
  title: string;
  slug: string;
  excerpt: string;
  status: PostStatus;
  /** Lý do ẩn (bài `ARCHIVED`) hoặc từ chối (bài `REJECTED`); `null` với trạng thái khác */
  rejectReason: string | null;
  /** ISO 8601, lúc tạo bài (mốc của màn Bài mới) */
  createdAt: string;
  /** ISO 8601; `null` nếu bài chưa từng đăng */
  publishedAt: string | null;
  viewCount: number;
  /** Mọi bình luận, kể cả đã ẩn */
  commentCount: number;
  likeCount: number;
  /** Số không thích (ADR 0009) */
  dislikeCount: number;
  mediaCount: number;
  author: UserSummary;
  category: CategoryRef;
}

/** Bài chứa bình luận, đủ để hiện tiêu đề và liên kết tới trang bài. */
export interface AdminCommentPostRef {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
}

/** Một bình luận trong bảng quản trị (`GET /admin/comments`), cả đang hiện lẫn đã ẩn. */
export interface AdminCommentListItem {
  id: string;
  /** Chữ thường: hiện dạng text, không render HTML */
  content: string;
  status: CommentStatus;
  /** `null`: bình luận gốc */
  parentId: string | null;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601; `null` nếu chưa sửa */
  editedAt: string | null;
  author: UserSummary;
  post: AdminCommentPostRef;
}

/**
 * Một thành viên trong bảng quản trị (`GET /admin/users`). Chỉ route admin trả `email` của người khác
 * (docs/phan-quyen.md), để trưởng xóm tìm theo email.
 */
export interface AdminUserListItem extends UserSummary {
  email: string;
  role: Role;
  /** Đang bị cấm: đã cấm và chưa tới hạn mở (cấm hết hạn thì `false`) */
  banned: boolean;
  /** Lý do cấm khi `banned`; `null` nếu không bị cấm */
  banReason: string | null;
  /** ISO 8601, lúc hết cấm; `null` là vĩnh viễn hoặc không bị cấm */
  banExpires: string | null;
  /** ISO 8601, ngày tham gia */
  createdAt: string;
  /** Mọi bài, mọi trạng thái */
  postCount: number;
  commentCount: number;
}
