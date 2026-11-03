import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Route không cần đăng nhập. Mặc định mọi route cần đăng nhập (AuthGuard toàn cục). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
