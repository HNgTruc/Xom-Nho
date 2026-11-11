import type { SearchQuery } from "@xom-nho/api";
import { serverApi } from "@/lib/server-api";

/**
 * Một trang kết quả tìm kiếm, gửi cookie của người đang xem (backend chỉ trả cho thành viên).
 * Từ khóa rỗng thì api-client trả trang rỗng, không gọi backend. Lỗi ném tiếp cho ErrorBoundary.
 */
export function searchPosts(query: SearchQuery) {
  return serverApi.search.posts(query);
}
