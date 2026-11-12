import { type PublicProfile, type Role, ROLE_VALUES, ROLES } from "@xom-nho/api";
import type { ProfileRow } from "./users.repository.js";

/** Cột `role` là chuỗi tự do (plugin admin của Better Auth). Giá trị lạ coi như hàng xóm thường. */
function toRole(value: string): Role {
  return (ROLE_VALUES as readonly string[]).includes(value) ? (value as Role) : ROLES.USER;
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
