import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

/**
 * Ba vai trò của Xóm Nhỏ cho plugin admin (docs/phan-quyen.md). Quyền này chỉ dùng cho các
 * endpoint quản trị của Better Auth (đổi vai trò, cấm). Quyền nghiệp vụ (viết bài, duyệt bài)
 * nằm ở RolesGuard + policy, không ở đây.
 */
const ac = createAccessControl(defaultStatements);

export const accessControl = ac;

export const roles = {
  user: ac.newRole({ ...userAc.statements }),
  author: ac.newRole({ ...userAc.statements }),
  admin: ac.newRole({ ...adminAc.statements }),
};
