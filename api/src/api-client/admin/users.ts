import type { AdminListUsersQuery, BanUserInput, SetUserRoleInput } from "../../schemas/admin.js";
import type { AdminUserListItem } from "../../types/admin.js";
import type { ApiResponse, PaginatedResponse } from "../../types/api-response.js";
import type { RequestFn } from "../client.js";

const path = (id: string, action: string) => `/admin/users/${encodeURIComponent(id)}${action}`;

/** Thành viên trong trang quản trị (`/admin/users`). Người không phải admin: 403. */
export function adminUsersApi(request: RequestFn) {
  return {
    /** `GET /admin/users`: tìm theo tên, email; lọc vai trò, đang bị cấm; mới tham gia trước. */
    list: (query: Partial<AdminListUsersQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<AdminUserListItem>>("/admin/users", { query, signal }),

    /** `PATCH /admin/users/:id/role`: đổi vai trò. Đổi của chính mình: ApiError 403. */
    setRole: (id: string, input: SetUserRoleInput) =>
      request<ApiResponse<AdminUserListItem>>(path(id, "/role"), { method: "PATCH", body: input }),

    /**
     * `POST /admin/users/:id/ban`: cấm, lý do bắt buộc, `expiresAt` bỏ trống là vĩnh viễn. Người bị cấm bị đăng
     * xuất ngay. Cấm chính mình hoặc trưởng xóm khác: ApiError 403.
     */
    ban: (id: string, input: BanUserInput) =>
      request<ApiResponse<AdminUserListItem>>(path(id, "/ban"), { method: "POST", body: input }),

    /** `POST /admin/users/:id/unban`: bỏ cấm. Không bị cấm thì giữ nguyên. */
    unban: (id: string) =>
      request<ApiResponse<AdminUserListItem>>(path(id, "/unban"), { method: "POST" }),
  };
}
