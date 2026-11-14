import { queryOptions } from "@tanstack/react-query";
import { ADMIN_POST_SORTS } from "@xom-nho/api";
import { adminPostsKeys } from "@/features/posts";
import { api } from "@/lib/api";

/**
 * Số liệu màn Tổng quan. Không tự cập nhật theo thời gian thực: mở lại màn sau 30 giây (staleTime chung) hoặc bấm
 * "Làm mới" thì tải lại; dòng "Cập nhật lúc …" lấy từ `generatedAt` nên luôn nói đúng số liệu tính lúc nào.
 */
export const dashboardQuery = queryOptions({
  queryKey: ["admin", "dashboard"],
  queryFn: async ({ signal }) => (await api.admin.dashboard.get(signal)).data,
});

const LIST_SIZE = 5;

/** 5 bài mới nhất tạo sau mốc lần xem trước của màn Bài mới; `meta.total` là số bài chưa xem. */
export function unseenPostsPreviewQuery(since: string) {
  return queryOptions({
    queryKey: [...adminPostsKeys.all, "unseen-preview", since],
    queryFn: ({ signal }) =>
      api.admin.posts.list(
        { since, sort: ADMIN_POST_SORTS.NEWEST, page: 1, pageSize: LIST_SIZE },
        signal,
      ),
  });
}

/** 5 thành viên mới tham gia gần nhất (bảng thành viên mặc định xếp mới trước). */
export const newMembersQuery = queryOptions({
  queryKey: ["admin", "users", "newest", LIST_SIZE],
  queryFn: ({ signal }) => api.admin.users.list({ page: 1, pageSize: LIST_SIZE }, signal),
});
