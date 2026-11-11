import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { guestAccess } from "@/features/auth/lib/guest-access";

/**
 * Khách chỉ thấy trang chào mừng, đăng nhập, đăng ký (ADR 0007). Kiểm tra lạc quan theo cookie phiên của
 * Better Auth, không gọi backend (proxy chạy cả với request prefetch). Quyền thật do backend quyết: mọi route
 * đọc dữ liệu trả 401 cho khách; trang còn kiểm tra lại bằng `requireUser`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const access = guestAccess(pathname, search, getSessionCookie(request) !== null);

  if (access.kind === "rewrite") {
    return NextResponse.rewrite(new URL(access.pathname, request.url));
  }
  if (access.kind === "redirect") {
    return NextResponse.redirect(new URL(access.href, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Bỏ qua file tĩnh, ảnh tối ưu, công cụ dev và file có đuôi (favicon.ico, ảnh). Slug không có dấu chấm.
  matcher: ["/((?!_next/|__nextjs|.*\\.\\w+$).*)"],
};
