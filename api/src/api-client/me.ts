import type { UpdateMeInput } from "../schemas/auth.js";
import type { ApiResponse } from "../types/api-response.js";
import type { AuthProviders, Me } from "../types/me.js";
import type { RequestFn } from "./client.js";

export function meApi(request: RequestFn) {
  return {
    /** `GET /me`: người đang đăng nhập. Chưa đăng nhập thì ném ApiError 401. */
    get: (signal?: AbortSignal) => request<ApiResponse<Me>>("/me", { signal }),
    /** `PATCH /me`: sửa tên, giới thiệu, ảnh. `{ image: null }` xóa ảnh đại diện (cả ảnh đã tải lên). */
    update: (input: UpdateMeInput) =>
      request<ApiResponse<Me>>("/me", { method: "PATCH", body: input }),
    /**
     * `PUT /me/avatar`: đổi ảnh đại diện, trường `file`. Chỉ ảnh JPG, PNG, WebP đến 5 MB; ảnh cũ bị xóa.
     * File sai loại, quá cỡ: ApiError 400.
     */
    uploadAvatar: (file: Blob, filename = "avatar", signal?: AbortSignal) => {
      const formData = new FormData();
      formData.append("file", file, filename);
      return request<ApiResponse<Me>>("/me/avatar", { method: "PUT", formData, signal });
    },
  };
}

export function authApi(request: RequestFn) {
  return {
    /** `GET /auth/providers`: Google/GitHub có bật không, để ẩn nút. */
    providers: (signal?: AbortSignal) =>
      request<ApiResponse<AuthProviders>>("/auth/providers", { signal }),
  };
}
