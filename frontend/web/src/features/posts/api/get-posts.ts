import type { ListPostsQuery } from "@xom-nho/api";
import { serverApi } from "@/lib/server-api";

/** Một trang bài đã đăng, gửi cookie của người đang xem (backend chỉ trả cho thành viên). Lỗi (backend tắt, 5xx) ném tiếp cho ErrorBoundary. */
export function getPosts(query: ListPostsQuery) {
  return serverApi.posts.list(query);
}
