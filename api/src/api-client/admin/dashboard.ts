import type { AdminDashboard } from "../../types/admin.js";
import type { ApiResponse } from "../../types/api-response.js";
import type { RequestFn } from "../client.js";

/** Màn Tổng quan trong trang quản trị (`/admin/dashboard`). Người không phải admin: 403. */
export function adminDashboardApi(request: RequestFn) {
  return {
    /**
     * `GET /admin/dashboard`: số đang ẩn (bài, bình luận); bài, bình luận, thành viên mới 7 ngày gần nhất so với
     * 7 ngày trước đó; số theo từng ngày trong 30 ngày (giờ Việt Nam) cho biểu đồ.
     */
    get: (signal?: AbortSignal) =>
      request<ApiResponse<AdminDashboard>>("/admin/dashboard", { signal }),
  };
}
