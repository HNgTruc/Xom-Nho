import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { AdminListUsersQuery } from "@xom-nho/api";
import { api } from "@/lib/api";

/** Khóa query thành viên; màn Bài mới (khung tác giả) cũng nằm trong nhóm `admin/users` nên làm mới chung. */
export const adminUsersKeys = {
  all: ["admin", "users"] as const,
  list: (query: Partial<AdminListUsersQuery>) => [...adminUsersKeys.all, "list", query] as const,
  stats: () => [...adminUsersKeys.all, "stats"] as const,
};

export function adminUsersListQuery(query: Partial<AdminListUsersQuery>) {
  return queryOptions({
    queryKey: adminUsersKeys.list(query),
    queryFn: ({ signal }) => api.admin.users.list(query, signal),
    placeholderData: keepPreviousData,
  });
}

/** Số trên các tab và dòng tóm tắt "N thành viên · M người mới trong 7 ngày". */
export const adminUsersStatsQuery = queryOptions({
  queryKey: adminUsersKeys.stats(),
  queryFn: async ({ signal }) => (await api.admin.users.stats(signal)).data,
});
