import type { ApiResponse } from "../types/api-response.js";
import type { Tag } from "../types/tag.js";
import type { RequestFn } from "./client.js";

export function tagsApi(request: RequestFn) {
  return {
    /** `GET /tags?q=`: gợi ý tag khi gõ, tối đa `LIMITS.TAG_SUGGEST_MAX` tag. */
    suggest: (q: string, signal?: AbortSignal) =>
      request<ApiResponse<Tag[]>>("/tags", { query: { q }, signal }),

    /** `GET /tags/:slug`: một tag, để làm tiêu đề trang `/tag/<slug>`. Không có thì ném ApiError 404. */
    get: (slug: string, signal?: AbortSignal) =>
      request<ApiResponse<Tag>>(`/tags/${encodeURIComponent(slug)}`, { signal }),
  };
}
