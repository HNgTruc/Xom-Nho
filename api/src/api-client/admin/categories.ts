import type { CategoryInput, ReorderCategoriesInput } from "../../schemas/admin.js";
import type { AdminCategory } from "../../types/admin.js";
import type { ApiResponse } from "../../types/api-response.js";
import type { RequestFn } from "../client.js";

const path = (id: string) => `/admin/categories/${encodeURIComponent(id)}`;

/** Danh mục trong trang quản trị (`/admin/categories`). Người không phải admin: 403. */
export function adminCategoriesApi(request: RequestFn) {
  return {
    /** `GET /admin/categories`: mọi danh mục theo thứ tự menu Chủ đề, kèm số bài đã đăng và tổng số bài. */
    list: (signal?: AbortSignal) =>
      request<ApiResponse<AdminCategory[]>>("/admin/categories", { signal }),

    /** `POST /admin/categories`: thêm vào cuối menu. Tên trùng: ApiError 409. */
    create: (input: CategoryInput) =>
      request<ApiResponse<AdminCategory>>("/admin/categories", { method: "POST", body: input }),

    /** `PATCH /admin/categories/:id`: sửa tên, mô tả, màu, biểu tượng; đường dẫn giữ nguyên. Tên trùng: 409. */
    update: (id: string, input: CategoryInput) =>
      request<ApiResponse<AdminCategory>>(path(id), { method: "PATCH", body: input }),

    /** `PUT /admin/categories/order`: lưu thứ tự mới, gửi đủ mọi id. Danh sách đã đổi: ApiError 409. */
    reorder: (input: ReorderCategoriesInput) =>
      request<ApiResponse<AdminCategory[]>>("/admin/categories/order", {
        method: "PUT",
        body: input,
      }),

    /** `DELETE /admin/categories/:id`: chỉ xóa được khi không còn bài nào. Còn bài: ApiError 409. */
    remove: (id: string) => request<void>(path(id), { method: "DELETE" }),
  };
}
