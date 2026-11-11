import { type PostSort, POST_SORTS } from "@xom-nho/api";

/**
 * Đường dẫn một danh sách bài (trang chủ, danh mục, tag) cho một cách sắp xếp và một trang.
 * Bỏ tham số mặc định để URL gọn: `/`, `/?sort=top&page=2`, `/danh-muc/doi-song?page=2`.
 */
export function feedHref(sort: PostSort, page = 1, basePath = "/"): string {
  const params = new URLSearchParams();
  if (sort !== POST_SORTS.NEW) params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
