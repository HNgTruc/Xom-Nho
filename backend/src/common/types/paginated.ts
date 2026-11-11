import type { PaginationMeta } from "@xom-nho/api";

/** Controller danh sách trả kiểu này; `ResponseInterceptor` đổi thành `{ data: items, meta }`. */
export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  return {
    items,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}
