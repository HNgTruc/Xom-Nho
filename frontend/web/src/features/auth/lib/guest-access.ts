import { signInHref } from "./sign-in-href";

/** Trang chào mừng: khách mở `/` thấy trang này (URL vẫn là `/`). */
export const WELCOME_PATH = "/chao-mung";

/** Trang khách mở được (ADR 0007). Mọi trang khác cần đăng nhập, kể cả trang thêm sau này. */
const GUEST_PATHS = new Set([WELCOME_PATH, "/dang-nhap", "/dang-ky"]);

export type GuestAccess =
  { kind: "pass" } | { kind: "rewrite"; pathname: string } | { kind: "redirect"; href: string };

/**
 * Quyết định của `proxy.ts` cho một request trang. Chỉ nhìn cookie phiên có hay không (kiểm tra lạc quan,
 * không gọi backend): cookie hết hạn hay bị khóa thì trang tự kiểm tra lại bằng `requireUser`.
 * - Khách mở `/`: hiện trang chào mừng tại chỗ.
 * - Khách mở trang khác: sang đăng nhập, xong quay lại đúng trang đó.
 * - Đã đăng nhập mà mở `/chao-mung`: về trang chủ.
 */
export function guestAccess(pathname: string, search: string, hasSession: boolean): GuestAccess {
  if (hasSession)
    return pathname === WELCOME_PATH ? { kind: "redirect", href: "/" } : { kind: "pass" };
  if (GUEST_PATHS.has(pathname)) return { kind: "pass" };
  if (pathname === "/") return { kind: "rewrite", pathname: WELCOME_PATH };
  return { kind: "redirect", href: signInHref(pathname + search) };
}
