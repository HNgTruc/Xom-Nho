import {
  type AdminPostListItem,
  type CategoryRef,
  type CommentPreview,
  type MediaItem,
  POST_STATUSES,
  toCategoryColor,
  type PostDetail,
  type PostListItem,
  type TagRef,
  type UserSummary,
} from "@xom-nho/api";
import type {
  AdminPostListRow,
  CommentPreviewRow,
  PostDetailRow,
  PostListRow,
} from "./posts.repository.js";

// Map từng trường thay vì trả nguyên object quan hệ: thêm cột vào `select` (ví dụ `email`) không tự lọt ra API

function toUserSummary(
  author: PostListRow["author"] | CommentPreviewRow["author"] | AdminPostListRow["author"],
): UserSummary {
  return {
    id: author.id,
    name: author.name,
    username: author.username,
    image: author.image,
    avatarId: author.avatarId,
  };
}

function toCategoryRef(category: PostListRow["category"]): CategoryRef {
  return { name: category.name, slug: category.slug, color: toCategoryColor(category.color) };
}

function toMediaItem(media: PostListRow["media"][number]): MediaItem {
  return { id: media.id, kind: media.kind, mimeType: media.mimeType };
}

function toTagRef({ tag }: PostListRow["tags"][number]): TagRef {
  return { name: tag.name, slug: tag.slug };
}

export function toCommentPreview(row: CommentPreviewRow): CommentPreview {
  return {
    id: row.id,
    content: row.content,
    author: toUserSummary(row.author),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Người đang xem đã Thích hay Không thích bài (loại trừ nhau, ADR 0009). */
export interface ViewerReactions {
  likedByMe: boolean;
  dislikedByMe: boolean;
}

/** Phần chung của thẻ bài và trang bài; Thích, Không thích của người xem tính riêng. */
function toPostBase(
  row: PostListRow,
  reactions: ViewerReactions,
): Omit<PostListItem, "latestComments"> {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    viewCount: row.viewCount,
    commentCount: row._count.comments,
    likeCount: row._count.likes,
    likedByMe: reactions.likedByMe,
    dislikeCount: row._count.dislikes,
    dislikedByMe: reactions.dislikedByMe,
    author: toUserSummary(row.author),
    category: toCategoryRef(row.category),
    tags: row.tags.map(toTagRef),
    media: row.media.map(toMediaItem),
  };
}

export function toPostListItem(
  row: PostListRow,
  viewer: ViewerReactions & { latestComments: readonly CommentPreviewRow[] },
): PostListItem {
  return {
    ...toPostBase(row, viewer),
    latestComments: viewer.latestComments.map(toCommentPreview),
  };
}

export function toPostDetail(row: PostDetailRow, reactions: ViewerReactions): PostDetail {
  return {
    ...toPostBase(row, reactions),
    content: row.content,
    contentFormat: row.contentFormat,
    status: row.status,
    rejectReason: moderationReason(row),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Lý do cũ có thể còn trong DB sau khi bài được gửi lại, duyệt, hiện lại; chỉ trả khi bài đang bị từ chối hoặc
 * đang bị ẩn (lý do ẩn lưu cùng cột, pages/admin.md mục "Ẩn bài").
 */
function moderationReason(row: Pick<PostDetailRow, "status" | "rejectReason">): string | null {
  const moderated = row.status === POST_STATUSES.REJECTED || row.status === POST_STATUSES.ARCHIVED;
  return moderated ? row.rejectReason : null;
}

export function toAdminPostListItem(row: AdminPostListRow): AdminPostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    status: row.status,
    rejectReason: moderationReason(row),
    createdAt: row.createdAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    viewCount: row.viewCount,
    commentCount: row._count.comments,
    likeCount: row._count.likes,
    dislikeCount: row._count.dislikes,
    mediaCount: row._count.media,
    author: toUserSummary(row.author),
    category: toCategoryRef(row.category),
  };
}
