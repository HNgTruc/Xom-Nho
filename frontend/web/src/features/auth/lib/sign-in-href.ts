/** Link trang đăng nhập, đăng nhập xong quay về `next` (đường dẫn trong trang, kèm query nếu có). */
export function signInHref(next: string): string {
  return next === "/" ? "/dang-nhap" : `/dang-nhap?next=${encodeURIComponent(next)}`;
}
