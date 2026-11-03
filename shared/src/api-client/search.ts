import { LIMITS } from "../constants/limits.js";
import type { SearchQuery } from "../schemas/search.js";
import type { PaginatedResponse } from "../types/api-response.js";
import type { PostListItem } from "../types/post.js";
import type { RequestFn } from "./client.js";

export function searchApi(request: RequestFn) {
  return {
    /**
     * `GET /search`: tìm bài theo tiêu đề, tóm tắt, tag; có dấu hay không dấu đều được.
     * Từ khóa rỗng (hoặc chỉ có khoảng trắng) trả danh sách rỗng ngay, không gọi backend.
     */
    posts: async (
      query: Partial<SearchQuery>,
      signal?: AbortSignal,
    ): Promise<PaginatedResponse<PostListItem>> => {
      const q = query.q?.trim() ?? "";
      if (!q) {
        return {
          data: [],
          meta: {
            page: 1,
            pageSize: query.pageSize ?? LIMITS.PAGE_SIZE_DEFAULT,
            total: 0,
            totalPages: 0,
          },
        };
      }
      return request<PaginatedResponse<PostListItem>>("/search", {
        query: { ...query, q },
        signal,
      });
    },
  };
}
