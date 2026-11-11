import type { ApiResponse } from "../types/api-response.js";
import type { Category } from "../types/category.js";
import type { RequestFn } from "./client.js";

export function categoriesApi(request: RequestFn) {
  return {
    /** `GET /categories`: tất cả danh mục theo thứ tự hiển thị, kèm số bài. */
    list: (signal?: AbortSignal) => request<ApiResponse<Category[]>>("/categories", { signal }),
  };
}
