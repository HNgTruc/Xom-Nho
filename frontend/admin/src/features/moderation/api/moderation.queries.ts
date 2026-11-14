import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { ADMIN_POST_SORTS } from "@xom-nho/api";
import { adminPostsKeys } from "@/features/posts";
import { api } from "@/lib/api";

const PAGE_SIZE = 20;

/**
 * Bài tạo sau mốc `since`, cũ nhất trước, tải thêm từng 20 bài ("Xem thêm"). Nằm trong nhóm khóa `admin/posts` nên
 * ẩn, hiện, xóa bài ở đâu cũng làm mới danh sách này.
 */
export function newPostsQuery(since: string) {
  return infiniteQueryOptions({
    queryKey: [...adminPostsKeys.all, "new", since],
    queryFn: ({ pageParam, signal }) =>
      api.admin.posts.list(
        { since, sort: ADMIN_POST_SORTS.OLDEST, page: pageParam, pageSize: PAGE_SIZE },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });
}

/** Số bài chưa xem cho sidebar: chỉ cần `meta.total` (một dòng). Làm mới mỗi phút. */
export function unseenCountQuery(since: string) {
  return queryOptions({
    queryKey: [...adminPostsKeys.all, "unseen-count", since],
    queryFn: async ({ signal }) =>
      (await api.admin.posts.list({ since, sort: ADMIN_POST_SORTS.OLDEST, pageSize: 1 }, signal))
        .meta.total,
    refetchInterval: 60_000,
  });
}

/** Nội dung đầy đủ của bài (trưởng xóm mở được cả bài đang ẩn): chữ, ảnh, video, số thích. */
export function postDetailQuery(slug: string) {
  return queryOptions({
    queryKey: [...adminPostsKeys.all, "detail", slug],
    queryFn: async ({ signal }) => (await api.posts.get(slug, signal)).data,
  });
}

/** Bình luận của bài, cả bình luận đã ẩn (trưởng xóm thấy). */
export function postCommentsQuery(postId: string) {
  return queryOptions({
    queryKey: ["admin", "comments", "by-post", postId],
    queryFn: async ({ signal }) => (await api.comments.list(postId, signal)).data,
  });
}

/** Thông tin tác giả cho khung bên cạnh bài: ngày tham gia, số bài, số bài đang bị ẩn. */
export function authorQuery(userId: string) {
  return queryOptions({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: async ({ signal }) => (await api.admin.users.get(userId, signal)).data,
    staleTime: 60_000,
  });
}
