/**
 * Đường dẫn quay lại sau khi đăng nhập (`?next=`), chỉ nhận đường dẫn nội bộ (web, admin).
 * Chặn chuyển hướng ra trang ngoài: "https://...", "//evil.com", "/\evil.com".
 */
export function safeNext(next: string | string[] | null | undefined, fallback = "/"): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\"))
    return fallback;
  return value;
}
