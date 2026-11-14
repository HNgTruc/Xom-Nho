import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { AdminListCommentsQuery } from "@xom-nho/api";
import { api } from "@/lib/api";

/** Khóa query bình luận trong trang quản trị; màn Bài mới cũng dùng nhóm `admin/comments` nên làm mới chung. */
export const adminCommentsKeys = {
  all: ["admin", "comments"] as const,
  list: (query: Partial<AdminListCommentsQuery>) =>
    [...adminCommentsKeys.all, "list", query] as const,
};

export function adminCommentsListQuery(query: Partial<AdminListCommentsQuery>) {
  return queryOptions({
    queryKey: adminCommentsKeys.list(query),
    queryFn: ({ signal }) => api.admin.comments.list(query, signal),
    placeholderData: keepPreviousData,
  });
}
