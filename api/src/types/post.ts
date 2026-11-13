import type { ContentFormat } from "../constants/media.js";
import type { PostStatus } from "../constants/statuses.js";
import type { Category } from "./category.js";
import type { MediaItem } from "./media.js";
import type { TagRef } from "./tag.js";
import type { UserSummary } from "./user.js";

/** Danh mục gắn trên bài: tên, slug để dựng liên kết `/danh-muc/<slug>`, màu để tô badge. */
export type CategoryRef = Pick<Category, "name" | "slug" | "color">;

/**
 * Bình luận xem trước trên thẻ bài: chỉ bình luận gốc đang hiện (không có trả lời, không có bình luận đã ẩn,
 * kể cả với trưởng xóm). Đủ để hiện tên, ảnh, nội dung; xem đủ thì vào trang bài.
 * `content` là chữ thường: hiện dạng text như `CommentItem`.
 */
export interface CommentPreview {
  id: string;
  content: string;
  author: UserSummary;
  /** ISO 8601 */
  createdAt: string;
}

/**
 * Thích, Không thích của một bài theo người đang xem. `PUT`, `DELETE /posts/:id/like` và `/dislike` trả kiểu
 * này. Thích và Không thích loại trừ nhau (ADR 0009): `liked` và `disliked` không cùng `true`.
 */
export interface PostLikeState {
  /** Người đang xem đã thích bài chưa */
  liked: boolean;
  /** Tổng số người thích bài */
  likeCount: number;
  /** Người đang xem đã bấm Không thích chưa */
  disliked: boolean;
  /** Tổng số người không thích bài, hiện công khai (ADR 0009) */
  dislikeCount: number;
}

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
  likeCount: number;
  /** Người đang xem đã thích bài chưa (để tô nút Thích, đặt `aria-pressed`) */
  likedByMe: boolean;
  /** Số người không thích bài, hiện công khai (ADR 0009) */
  dislikeCount: number;
  /** Người đang xem đã bấm Không thích chưa; không cùng `true` với `likedByMe` */
  dislikedByMe: boolean;
  /** Tối đa `LIMITS.FEED_LATEST_COMMENTS` bình luận gốc đang hiện, mới nhất trước */
  latestComments: CommentPreview[];
  author: UserSummary;
  category: CategoryRef;
  tags: TagRef[];
  /** Ảnh, video theo thứ tự trong bài (tối đa `LIMITS.POST_MEDIA_MAX`) */
  media: MediaItem[];
}

/**
 * `GET /posts/:slug`. Bài chưa đăng chỉ tác giả và trưởng xóm xem được, người khác nhận 404.
 * `content` là Markdown thô hoặc chữ thường (xem `contentFormat`): frontend tự render an toàn.
 * Không có `latestComments`: trang bài tải đủ bình luận bằng `GET /posts/:id/comments`.
 */
export interface PostDetail extends Omit<PostListItem, "latestComments"> {
  content: string;
  /** MARKDOWN: render qua component an toàn. PLAIN: chữ thường, giữ xuống dòng */
  contentFormat: ContentFormat;
  status: PostStatus;
  /**
   * Lý do bị từ chối (REJECTED) hoặc bị trưởng xóm ẩn (ARCHIVED, `archivedNote`). `null` với trạng thái khác.
   * Bài ẩn chỉ tác giả và trưởng xóm mở được nên chỉ họ thấy lý do.
   */
  rejectReason: string | null;
  /** ISO 8601 */
  updatedAt: string;
}
