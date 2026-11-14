import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { AdminListPostsQuery, AdminStatsRange } from "@xom-nho/api";
import { api } from "@/lib/api";

/** Khóa query của bài trong trang quản trị. Mọi thao tác ghi làm mới cả nhóm `all`. */
export const adminPostsKeys = {
  all: ["admin", "posts"] as const,
  list: (query: Partial<AdminListPostsQuery>) => [...adminPostsKeys.all, "list", query] as const,
  stats: (range: AdminStatsRange) => [...adminPostsKeys.all, "stats", range] as const,
};

/** Một trang bài; giữ trang cũ trong lúc tải trang mới (bảng không nháy về dòng xương mỗi lần đổi trang). */
export function adminPostsListQuery(query: Partial<AdminListPostsQuery>) {
  return queryOptions({
    queryKey: adminPostsKeys.list(query),
    queryFn: ({ signal }) => api.admin.posts.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

export function adminPostStatsQuery(range: AdminStatsRange) {
  return queryOptions({
    queryKey: adminPostsKeys.stats(range),
    queryFn: async ({ signal }) => (await api.admin.posts.stats({ range }, signal)).data,
    placeholderData: keepPreviousData,
  });
}

/** Danh mục cho bộ lọc (ít đổi). */
export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async ({ signal }) => (await api.categories.list(signal)).data,
  staleTime: 5 * 60_000,
});
