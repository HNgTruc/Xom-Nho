import type { AdminCommentListItem, CommentItem, CommentThread } from "@xom-nho/api";
import type { AdminCommentRow, CommentRow } from "./comments.repository.js";

// Map từng trường thay vì trả nguyên row: thêm cột vào `select` (ví dụ `authorId`) không tự lọt ra API

export function toAdminCommentListItem(row: AdminCommentRow): AdminCommentListItem {
  const { postId: _postId, ...item } = toCommentItem(row);
  return {
    ...item,
    post: {
      id: row.post.id,
      title: row.post.title,
      slug: row.post.slug,
      excerpt: row.post.excerpt,
    },
  };
}

export function toCommentItem(row: CommentRow): CommentItem {
  return {
    id: row.id,
    postId: row.postId,
    parentId: row.parentId,
    content: row.content,
    author: {
      id: row.author.id,
      name: row.author.name,
      username: row.author.username,
      image: row.author.image,
      avatarId: row.author.avatarId,
    },
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    editedAt: row.editedAt?.toISOString() ?? null,
  };
}

/**
 * Ghép danh sách phẳng (đã sắp cũ trước) thành các nhánh: bình luận gốc kèm trả lời. Trả lời mà bình luận gốc
 * không có trong danh sách (gốc đã ẩn với người xem) thì bỏ, để không hiện trả lời mồ côi.
 */
export function toCommentThreads(rows: readonly CommentRow[]): CommentThread[] {
  const replies = new Map<string, CommentItem[]>();
  for (const row of rows) {
    if (row.parentId === null) continue;
    const list = replies.get(row.parentId) ?? [];
    list.push(toCommentItem(row));
    replies.set(row.parentId, list);
  }
  return rows
    .filter((row) => row.parentId === null)
    .map((row) => ({ ...toCommentItem(row), replies: replies.get(row.id) ?? [] }));
}
