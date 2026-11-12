import { POST_STATUSES, type PostStatus, ROLES } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";

/** Phần của file mà policy cần, lấy từ database. */
export interface MediaAccessTarget {
  ownerId: string;
  purpose: "POST" | "AVATAR";
  /** Bài đang gắn; `null` khi file mới tải lên, chưa đăng */
  post: { status: PostStatus } | null;
}

/**
 * Quyền xem một ảnh, video (docs/phan-quyen.md). Route đã cần đăng nhập (ADR 0007), nên ở đây chỉ còn:
 * ảnh đại diện và file trong bài đã đăng thì mọi thành viên xem; còn lại chỉ người tải lên và trưởng xóm.
 */
export const FilesPolicy = {
  canView(user: SessionUser, media: MediaAccessTarget): boolean {
    if (media.purpose === "AVATAR") return true;
    if (media.post?.status === POST_STATUSES.PUBLISHED) return true;
    return user.id === media.ownerId || user.role === ROLES.ADMIN;
  },
};
