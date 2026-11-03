import type { ListPostsQuery } from "@xom-nho/shared";
import { publicApi } from "@/lib/server-api";

/** Một trang bài đã đăng. Dữ liệu công khai nên không gửi cookie. Lỗi (backend tắt, 5xx) ném tiếp cho ErrorBoundary. */
export function getPosts(query: ListPostsQuery) {
  return publicApi.posts.list(query);
}
