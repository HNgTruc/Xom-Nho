import {
  type CategoryRef,
  POST_STATUSES,
  toCategoryColor,
  type PostDetail,
  type PostListItem,
  type TagRef,
  type UserSummary,
} from "@xom-nho/api";
import type { PostDetailRow, PostListRow } from "./posts.repository.js";

// Map từng trường thay vì trả nguyên object quan hệ: thêm cột vào `select` (ví dụ `email`) không tự lọt ra API

function toUserSummary(author: PostListRow["author"]): UserSummary {
  return { id: author.id, name: author.name, username: author.username, image: author.image };
}

function toCategoryRef(category: PostListRow["category"]): CategoryRef {
  return { name: category.name, slug: category.slug, color: toCategoryColor(category.color) };
}

function toTagRef({ tag }: PostListRow["tags"][number]): TagRef {
  return { name: tag.name, slug: tag.slug };
}

export function toPostListItem(row: PostListRow): PostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    viewCount: row.viewCount,
    commentCount: row._count.comments,
    author: toUserSummary(row.author),
    category: toCategoryRef(row.category),
    tags: row.tags.map(toTagRef),
  };
}

export function toPostDetail(row: PostDetailRow): PostDetail {
  return {
    ...toPostListItem(row),
    content: row.content,
    status: row.status,
    // Lý do cũ có thể còn trong DB sau khi bài được gửi lại và duyệt; chỉ trả khi bài đang bị từ chối
    rejectReason: row.status === POST_STATUSES.REJECTED ? row.rejectReason : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}
