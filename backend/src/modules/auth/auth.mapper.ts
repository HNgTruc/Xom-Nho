import { type Me, type Role, ROLE_VALUES, ROLES } from "@xom-nho/api";
import type { MeRow } from "./auth.repository.js";

export function toMe(row: MeRow): Me {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username,
    image: row.image,
    avatarId: row.avatarId,
    bio: row.bio,
    role: ROLE_VALUES.includes(row.role as Role) ? (row.role as Role) : ROLES.USER,
    createdAt: row.createdAt.toISOString(),
  };
}
