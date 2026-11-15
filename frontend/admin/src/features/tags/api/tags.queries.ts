import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { AdminListTagsQuery } from "@xom-nho/api";
import { api } from "@/lib/api";

/** Khóa query thẻ ở trang quản trị. Gộp, xóa làm mới cả nhóm `all`. */
export const adminTagsKeys = {
  all: ["admin", "tags"] as const,
  list: (query: Partial<AdminListTagsQuery>) => [...adminTagsKeys.all, "list", query] as const,
};

/** Một trang thẻ; giữ trang cũ trong lúc tải trang mới (bảng không nháy về dòng xương). */
export function adminTagsListQuery(query: Partial<AdminListTagsQuery>) {
  return queryOptions({
    queryKey: adminTagsKeys.list(query),
    queryFn: ({ signal }) => api.admin.tags.list(query, signal),
    placeholderData: keepPreviousData,
  });
}
