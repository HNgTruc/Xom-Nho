import type { ContentFormat } from "../constants/media.js";
import type { PostStatus } from "../constants/statuses.js";
import type { Category } from "./category.js";
import type { MediaItem } from "./media.js";
import type { TagRef } from "./tag.js";
import type { UserSummary } from "./user.js";

/** Danh mục gắn trên bài: tên, slug để dựng liên kết `/danh-muc/<slug>`, màu để tô badge. */
export type CategoryRef = Pick<Category, "name" | "slug" | "color">;

/**
 * Một bài trong danh sách: `GET /posts`, `GET /search`.
 * Không có `content` để danh sách nhẹ.
 */
export interface PostListItem {
  id: string;
  /** Rỗng với bài soạn kiểu mạng xã hội không đặt tiêu đề: frontend hiện `excerpt` thay */
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
  /** Ảnh, video theo thứ tự trong bài (tối đa `LIMITS.POST_MEDIA_MAX`) */
  media: MediaItem[];
}

/**
 * `GET /posts/:slug`. Bài chưa đăng chỉ tác giả và trưởng xóm xem được, người khác nhận 404.
 * `content` là Markdown thô hoặc chữ thường (xem `contentFormat`): frontend tự render an toàn.
 */
export interface PostDetail extends PostListItem {
  content: string;
  /** MARKDOWN: render qua component an toàn. PLAIN: chữ thường, giữ xuống dòng */
  contentFormat: ContentFormat;
  status: PostStatus;
  /** Lý do bị từ chối. `null` nếu bài không ở trạng thái REJECTED */
  rejectReason: string | null;
  /** ISO 8601 */
  updatedAt: string;
}
