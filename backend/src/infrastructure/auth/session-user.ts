import { type Role, ROLE_VALUES, ROLES } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";

/** Phần `user` trong phiên Better Auth (cột lõi + plugin admin + additionalFields). */
export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
}

function toRole(role: string | null | undefined): Role {
  return ROLE_VALUES.includes(role as Role) ? (role as Role) : ROLES.USER;
}

/** Đang bị cấm: `banned` và chưa tới hạn mở (không có hạn = cấm vĩnh viễn). */
export function isBanned(user: AuthUserRecord, now = new Date()): boolean {
  if (!user.banned) return false;
  if (!user.banExpires) return true;
  return new Date(user.banExpires) > now;
}

export function toSessionUser(user: AuthUserRecord, now = new Date()): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username ?? null,
    role: toRole(user.role),
    banned: isBanned(user, now),
  };
}

export function bannedMessage(user: AuthUserRecord): string {
  return user.banReason
    ? `Tài khoản của bạn đã bị khóa. Lý do: ${user.banReason}`
    : "Tài khoản của bạn đã bị khóa. Liên hệ trưởng xóm nếu bạn nghĩ đây là nhầm lẫn.";
}
