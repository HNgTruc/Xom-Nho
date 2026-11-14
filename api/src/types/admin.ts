import type { Role } from "../constants/roles.js";
import type { AdminDashboardMetric, AdminStatsRange } from "../schemas/admin.js";
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

/**
 * `GET /admin/posts/stats`: thẻ số liệu ở màn Bài viết. `total` là số bài **tạo** trong khoảng (mọi trạng thái),
 * `previousTotal` là khoảng liền trước cùng độ dài để so sánh (`null` với `all`). `byStatus` đếm mọi bài, không
 * theo khoảng: số trên các tab trạng thái.
 */
export interface AdminPostStats {
  range: AdminStatsRange;
  /** ISO 8601, đầu khoảng; `null` với `all` */
  from: string | null;
  /** ISO 8601, lúc tính số liệu */
  to: string;
  total: number;
  previousTotal: number | null;
  byStatus: Record<PostStatus, number>;
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

/**
 * `GET /admin/users/:id`: một thành viên, cho khung tác giả ở màn Bài mới và trang thành viên. Số bị ẩn là số
 * **đang** ẩn: bài đã hiện lại không còn tính (chưa có lịch sử kiểm duyệt).
 */
export interface AdminUserDetail extends AdminUserListItem {
  hiddenPostCount: number;
  hiddenCommentCount: number;
}

/** `GET /admin/users/stats`: số trên các tab và dòng tóm tắt của màn Thành viên. */
export interface AdminUserStats {
  total: number;
  /** Tham gia trong 7 ngày gần nhất */
  newLast7Days: number;
  byRole: Record<Role, number>;
  /** Đang bị cấm (cấm hết hạn không tính) */
  banned: number;
}

/** Một ngày (giờ Việt Nam) trên biểu đồ Tổng quan: số tạo mới trong ngày, mọi trạng thái. */
export interface AdminDashboardDay {
  /** `YYYY-MM-DD` theo giờ Việt Nam */
  date: string;
  /** Bài tạo trong ngày, mọi trạng thái (như thẻ số liệu màn Bài viết) */
  posts: number;
  /** Bình luận viết trong ngày, kể cả đã ẩn */
  comments: number;
  /** Thành viên tham gia trong ngày */
  members: number;
}

/** Tổng của 7 ngày gần nhất (tính cả hôm nay) và 7 ngày liền trước, để thẻ số liệu so "tăng"/"giảm". */
export interface AdminDashboardTrend {
  current: number;
  previous: number;
}

/**
 * `GET /admin/dashboard`: màn Tổng quan (pages/admin.md mục "Thẻ số liệu"). `daily` có đúng 30 ngày, cũ trước,
 * ngày cuối là hôm nay; `recent` cộng từ chính `daily` nên số trên thẻ khớp với cột trên biểu đồ.
 */
export interface AdminDashboard {
  /** ISO 8601, lúc tính số liệu ("Cập nhật lúc 14:05") */
  generatedAt: string;
  /** Đang ẩn: bài `ARCHIVED`, bình luận `HIDDEN`, mọi lúc */
  hidden: { posts: number; comments: number };
  recent: Record<AdminDashboardMetric, AdminDashboardTrend>;
  daily: AdminDashboardDay[];
}
