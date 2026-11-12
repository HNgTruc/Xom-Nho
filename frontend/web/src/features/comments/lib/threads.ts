import type { CommentItem, CommentThread } from "@xom-nho/api";

/**
 * Cập nhật danh sách nhánh bình luận ở trình duyệt sau khi gửi, sửa, xóa (không tải lại cả trang).
 * Hàm thuần, trả mảng mới; thứ tự giữ như backend: cũ trước mới sau.
 */

/** Thêm bình luận vừa gửi: gốc thì thành nhánh mới cuối danh sách, trả lời thì vào cuối nhánh của nó. */
export function addComment(threads: readonly CommentThread[], item: CommentItem): CommentThread[] {
  if (item.parentId === null) return [...threads, { ...item, replies: [] }];
  return threads.map((thread) =>
    thread.id === item.parentId ? { ...thread, replies: [...thread.replies, item] } : thread,
  );
}

/** Thay bình luận đã sửa, giữ nguyên các trả lời của nhánh. */
export function replaceComment(
  threads: readonly CommentThread[],
  item: CommentItem,
): CommentThread[] {
  return threads.map((thread) => {
    if (thread.id === item.id) return { ...item, replies: thread.replies };
    if (thread.id !== item.parentId) return thread;
    return {
      ...thread,
      replies: thread.replies.map((reply) => (reply.id === item.id ? item : reply)),
    };
  });
}

/** Bỏ bình luận đã xóa; xóa bình luận gốc thì mất cả nhánh (backend cũng xóa các trả lời). */
export function removeComment(threads: readonly CommentThread[], id: string): CommentThread[] {
  return threads
    .filter((thread) => thread.id !== id)
    .map((thread) =>
      thread.replies.some((reply) => reply.id === id)
        ? { ...thread, replies: thread.replies.filter((reply) => reply.id !== id) }
        : thread,
    );
}

/** Tổng số bình luận, cả trả lời. */
export function countComments(threads: readonly CommentThread[]): number {
  return threads.reduce((total, thread) => total + 1 + thread.replies.length, 0);
}

/**
 * Chữ điền sẵn khi bấm "Trả lời": trả lời một trả lời của người khác thì gọi tên ("@Lan Anh "), vì mọi trả lời
 * nằm chung một nhánh (docs/tinh-nang.md mục 3). Trả lời bình luận gốc, hay của chính mình, thì để trống.
 */
export function mentionPrefix(target: CommentItem, viewerId: string): string {
  if (target.parentId === null || target.author.id === viewerId) return "";
  return `@${target.author.name} `;
}
