import type { Role } from "../constants/roles.js";

/** `GET /api/v1/me`: người đang đăng nhập. Chỉ chính người đó thấy `email`. */
export interface Me {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  role: Role;
  createdAt: string;
}

/** `GET /api/v1/auth/providers`: cách đăng nhập đang bật, để frontend ẩn nút không dùng được. */
export interface AuthProviders {
  email: true;
  google: boolean;
  github: boolean;
}
