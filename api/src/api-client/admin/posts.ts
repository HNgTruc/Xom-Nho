import type { AdminListPostsQuery, ArchivePostInput } from "../../schemas/admin.js";
import type { AdminPostListItem } from "../../types/admin.js";
import type { ApiResponse, PaginatedResponse } from "../../types/api-response.js";
import type { RequestFn } from "../client.js";

const path = (id: string, action = "") => `/admin/posts/${encodeURIComponent(id)}${action}`;

/** Bài viết trong trang quản trị (`/admin/posts`, docs/api.md mục Quản trị). Người không phải admin: 403. */
export function adminPostsApi(request: RequestFn) {
  return {
    /**
     * `GET /admin/posts`: mọi bài, mọi trạng thái, có lọc, tìm, phân trang. Màn Bài mới gửi
     * `{ since, sort: "oldest" }`; `meta.total` là số bài tạo sau mốc.
     */
    list: (query: Partial<AdminListPostsQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<AdminPostListItem>>("/admin/posts", { query, signal }),

    /** `POST /admin/posts/:id/archive`: ẩn bài đang hiện, lý do bắt buộc. Bài không đang hiện: ApiError 409. */
    archive: (id: string, input: ArchivePostInput) =>
      request<ApiResponse<AdminPostListItem>>(path(id, "/archive"), {
        method: "POST",
        body: input,
      }),

    /** `POST /admin/posts/:id/restore`: hiện lại bài đang ẩn, xóa lý do. Bài không đang ẩn: ApiError 409. */
    restore: (id: string) =>
      request<ApiResponse<AdminPostListItem>>(path(id, "/restore"), { method: "POST" }),

    /** `DELETE /admin/posts/:id`: xóa hẳn bài bất kỳ, cả bình luận, ảnh, video. */
    remove: (id: string) => request<void>(path(id), { method: "DELETE" }),
  };
}
