import type { AdminListTagsQuery, MergeTagInput } from "../../schemas/admin.js";
import type { AdminTag } from "../../types/admin.js";
import type { ApiResponse, PaginatedResponse } from "../../types/api-response.js";
import type { RequestFn } from "../client.js";

const path = (id: string, action = "") => `/admin/tags/${encodeURIComponent(id)}${action}`;

/** Thẻ trong trang quản trị (`/admin/tags`). Người không phải admin: 403. */
export function adminTagsApi(request: RequestFn) {
  return {
    /** `GET /admin/tags`: tìm theo tên, sắp theo số bài (mặc định) hoặc tên, phân trang. */
    list: (query: Partial<AdminListTagsQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<AdminTag>>("/admin/tags", { query, signal }),

    /**
     * `POST /admin/tags/:id/merge`: chuyển mọi bài của thẻ này sang `targetId` rồi xóa thẻ này. Trả thẻ đích với
     * số bài mới. Gộp vào chính nó: ApiError 400; thẻ không có: 404.
     */
    merge: (id: string, input: MergeTagInput) =>
      request<ApiResponse<AdminTag>>(path(id, "/merge"), { method: "POST", body: input }),

    /** `DELETE /admin/tags/:id`: xóa thẻ, gỡ khỏi mọi bài (bài vẫn còn). */
    remove: (id: string) => request<void>(path(id), { method: "DELETE" }),
  };
}
