import type { PostStatus } from "../constants/statuses.js";
import type { Category } from "./category.js";
import type { TagRef } from "./tag.js";
import type { UserSummary } from "./user.js";

/** Danh mục gắn trên bài: chỉ cần tên và slug để dựng liên kết `/danh-muc/<slug>`. */
export type CategoryRef = Pick<Category, "name" | "slug">;

/**
 * Một bài trong danh sách: `GET /posts`, `GET /search`.
 * Không có `content` để danh sách nhẹ.
 */
export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** ISO 8601. Bài đã đăng luôn có; `null` với bản nháp, bài chờ duyệt, bị từ chối */
  publishedAt: string | null;
  viewCount: number;
  /** Chỉ đếm bình luận đang hiện */
  commentCount: number;
  author: UserSummary;
  category: CategoryRef;
  tags: TagRef[];
}

/**
 * `GET /posts/:slug`. Bài chưa đăng chỉ tác giả và trưởng xóm xem được, người khác nhận 404.
 * `content` là Markdown thô: frontend tự render qua component an toàn.
 */
export interface PostDetail extends PostListItem {
  content: string;
  status: PostStatus;
  /** Lý do bị từ chối. `null` nếu bài không ở trạng thái REJECTED */
  rejectReason: string | null;
  /** ISO 8601 */
  updatedAt: string;
}
