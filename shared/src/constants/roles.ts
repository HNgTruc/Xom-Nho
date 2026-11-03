/** Mã vai trò lưu ở cột `role` của bảng `user` (plugin admin của Better Auth). Xem docs/phan-quyen.md. */
export const ROLES = {
  USER: "user",
  AUTHOR: "author",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = Object.values(ROLES) as [Role, ...Role[]];

export const ROLE_LABELS: Record<Role, string> = {
  user: "Hàng xóm",
  author: "Cây bút",
  admin: "Trưởng xóm",
};
