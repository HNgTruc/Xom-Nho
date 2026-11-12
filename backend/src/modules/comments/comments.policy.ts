import { COMMENT_STATUSES, type CommentStatus, ROLES } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";

/** Phần của bình luận mà policy cần. Luôn lấy từ database, không tin dữ liệu client gửi. */
export interface CommentAccessTarget {
  authorId: string;
  status: CommentStatus;
}

/**
 * Quyền trên một bình luận (docs/phan-quyen.md, docs/tinh-nang.md mục 3). Hàm thuần, service gọi trên bản ghi
 * lấy từ database. Quyền trên bài chứa bình luận do PostsService kiểm tra riêng.
 */
export const CommentsPolicy = {
  /** Trưởng xóm thấy cả bình luận đã ẩn (hiện mờ); người khác, kể cả người viết, chỉ thấy bình luận đang hiện. */
  seesHidden(user: SessionUser): boolean {
    return user.role === ROLES.ADMIN;
  },

  canView(user: SessionUser, comment: CommentAccessTarget): boolean {
    return comment.status === COMMENT_STATUSES.VISIBLE || CommentsPolicy.seesHidden(user);
  },

  /**
   * Sửa, xóa: chỉ người viết, khi bình luận còn hiện. Trưởng xóm xử lý bình luận của người khác bằng route
   * admin (ẩn, xóa), không qua đây.
   */
  canModify(user: SessionUser, comment: CommentAccessTarget): boolean {
    if (user.banned) return false;
    return user.id === comment.authorId && comment.status === COMMENT_STATUSES.VISIBLE;
  },
};
