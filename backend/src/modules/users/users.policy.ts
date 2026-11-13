import { type Role, ROLES } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";

/** Phần của thành viên mà policy cần. Luôn lấy từ database, không tin dữ liệu client gửi. */
export interface UserAccessTarget {
  id: string;
  role: Role;
}

/**
 * Quyền của trưởng xóm trên một thành viên (docs/phan-quyen.md, .claude/rules/bao-mat.md). Vai trò `admin` đã
 * được `@Roles` kiểm tra; ở đây là điều kiện trên bản ghi. Hàm thuần, service gọi trên bản ghi từ database.
 */
export const UsersPolicy = {
  /** Không tự đổi vai trò của mình (tránh tự hạ quyền rồi không ai còn là trưởng xóm). */
  canChangeRole(actor: SessionUser, target: UserAccessTarget): boolean {
    return actor.id !== target.id;
  },

  /**
   * Không tự cấm mình, không cấm trưởng xóm khác (chốt 2026-11-13): muốn cấm thì hạ vai trò người đó trước,
   * để không cấm nhầm. Bỏ cấm thì không giới hạn.
   */
  canBan(actor: SessionUser, target: UserAccessTarget): boolean {
    return actor.id !== target.id && target.role !== ROLES.ADMIN;
  },
};
