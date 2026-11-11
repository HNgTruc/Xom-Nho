/**
 * Đường dẫn trang tìm kiếm. Bỏ tham số mặc định để URL gọn: `/tim-kiem?q=ban+tron`,
 * `/tim-kiem?q=do+an&category=doi-song&page=2`. Từ khóa rỗng: `/tim-kiem`.
 */
export function searchHref({
  q,
  category,
  page = 1,
}: {
  q: string;
  category?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  const keyword = q.trim();
  if (keyword) params.set("q", keyword);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/tim-kiem?${query}` : "/tim-kiem";
}
