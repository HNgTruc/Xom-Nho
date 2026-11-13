import type { AdminListCommentsQuery } from "../../schemas/admin.js";
import type { AdminCommentListItem } from "../../types/admin.js";
import type { ApiResponse, PaginatedResponse } from "../../types/api-response.js";
import type { RequestFn } from "../client.js";

const path = (id: string, action = "") => `/admin/comments/${encodeURIComponent(id)}${action}`;

/** Bình luận trong trang quản trị (`/admin/comments`). Người không phải admin: 403. */
export function adminCommentsApi(request: RequestFn) {
  return {
    /** `GET /admin/comments`: mọi bình luận (cả đã ẩn), mới nhất trước, có lọc, tìm, phân trang. */
    list: (query: Partial<AdminListCommentsQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<AdminCommentListItem>>("/admin/comments", { query, signal }),

    /** `POST /admin/comments/:id/hide`: ẩn bình luận. Đã ẩn rồi thì giữ nguyên. */
    hide: (id: string) =>
      request<ApiResponse<AdminCommentListItem>>(path(id, "/hide"), { method: "POST" }),

    /** `POST /admin/comments/:id/show`: hiện lại bình luận. Đang hiện thì giữ nguyên. */
    show: (id: string) =>
      request<ApiResponse<AdminCommentListItem>>(path(id, "/show"), { method: "POST" }),

    /** `DELETE /admin/comments/:id`: xóa hẳn bình luận, trả lời bên dưới bị xóa theo. */
    remove: (id: string) => request<void>(path(id), { method: "DELETE" }),
  };
}
