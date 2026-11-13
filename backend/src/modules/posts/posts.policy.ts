import { POST_STATUSES, type PostStatus, ROLES } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";

/** Phần của bài mà policy cần. Luôn lấy từ database, không tin dữ liệu client gửi. */
export interface PostAccessTarget {
  status: PostStatus;
  authorId: string;
}

/**
 * Quyền trên một bài cụ thể (docs/phan-quyen.md). Hàm thuần, service gọi trên bản ghi lấy từ database.
 * Người bị cấm được coi như khách (AuthGuard đã không gắn họ vào request ở route công khai).
 */
export const PostsPolicy = {
  /** Bài đã đăng thì ai cũng xem; bài ở trạng thái khác chỉ tác giả và trưởng xóm xem. */
  canView(user: SessionUser | undefined, post: PostAccessTarget): boolean {
    if (post.status === POST_STATUSES.PUBLISHED) return true;
    if (!user || user.banned) return false;
    return user.id === post.authorId || user.role === ROLES.ADMIN;
  },

  /**
   * Sửa, xóa qua route thường (`PATCH`, `DELETE /posts/:id`): chỉ tác giả, ở mọi trạng thái (kể cả bài bị ẩn,
   * để tác giả sửa lại hay gỡ đi). Trưởng xóm xử lý bài của người khác bằng route admin, không qua đây.
   */
  canModify(user: SessionUser, post: PostAccessTarget): boolean {
    if (user.banned) return false;
    return user.id === post.authorId;
  },

  /**
   * Thích bài: chỉ bài đã đăng, mọi thành viên không bị cấm (kể cả tác giả tự thích bài mình). Bỏ thích thì chỉ
   * cần xem được bài, để ai đã thích trước khi bài bị ẩn vẫn gỡ được.
   */
  canLike(user: SessionUser, post: PostAccessTarget): boolean {
    if (user.banned) return false;
    return post.status === POST_STATUSES.PUBLISHED;
  },

  /** Không thích bài (ADR 0009): cùng điều kiện với Thích. Bỏ Không thích chỉ cần xem được bài. */
  canDislike(user: SessionUser, post: PostAccessTarget): boolean {
    return PostsPolicy.canLike(user, post);
  },

  /**
   * Trưởng xóm ẩn bài (`POST /admin/posts/:id/archive`): chỉ bài đang hiện trên xóm. Vai trò đã được
   * `@Roles("admin")` kiểm tra; ở đây chỉ còn điều kiện trên bản ghi.
   */
  canArchive(post: Pick<PostAccessTarget, "status">): boolean {
    return post.status === POST_STATUSES.PUBLISHED;
  },

  /** Hiện lại (`POST /admin/posts/:id/restore`): chỉ bài đang ẩn. */
  canRestore(post: Pick<PostAccessTarget, "status">): boolean {
    return post.status === POST_STATUSES.ARCHIVED;
  },
};
