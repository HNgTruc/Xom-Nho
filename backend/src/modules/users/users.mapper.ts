import {
  type AdminUserListItem,
  type PublicProfile,
  type Role,
  ROLE_VALUES,
  ROLES,
} from "@xom-nho/api";
import { isBanned } from "../../infrastructure/auth/session-user.js";
import type { AdminUserRow, ProfileRow } from "./users.repository.js";

/** Cột `role` là chuỗi tự do (plugin admin của Better Auth). Giá trị lạ coi như hàng xóm thường. */
export function toRole(value: string): Role {
  return (ROLE_VALUES as readonly string[]).includes(value) ? (value as Role) : ROLES.USER;
}

/**
 * Dòng bảng thành viên. `banned` theo cùng quy tắc AuthGuard dùng (`isBanned`): cấm đã hết hạn coi như không
 * bị cấm, và không trả lý do, hạn cũ còn sót trong DB.
 */
export function toAdminUserListItem(row: AdminUserRow, now = new Date()): AdminUserListItem {
  const banned = isBanned(row, now);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    image: row.image,
    avatarId: row.avatarId,
    role: toRole(row.role),
    banned,
    banReason: banned ? row.banReason : null,
    banExpires: banned ? (row.banExpires?.toISOString() ?? null) : null,
    createdAt: row.createdAt.toISOString(),
    postCount: row._count.posts,
    commentCount: row._count.comments,
  };
}

export function toPublicProfile(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    image: row.image,
    avatarId: row.avatarId,
    bio: row.bio,
    role: toRole(row.role),
    createdAt: row.createdAt.toISOString(),
    postCount: row._count.posts,
  };
}
