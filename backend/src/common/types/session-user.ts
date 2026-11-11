import type { Role } from "@xom-nho/api";

/** Người đang đăng nhập, do `AuthGuard` gắn vào request (giai đoạn 2, từ phiên Better Auth). */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: Role;
  banned: boolean;
}
