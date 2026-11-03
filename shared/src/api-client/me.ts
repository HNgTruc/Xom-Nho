import type { UpdateMeInput } from "../schemas/auth.js";
import type { ApiResponse } from "../types/api-response.js";
import type { AuthProviders, Me } from "../types/me.js";
import type { RequestFn } from "./client.js";

export function meApi(request: RequestFn) {
  return {
    /** `GET /me`: người đang đăng nhập. Chưa đăng nhập thì ném ApiError 401. */
    get: (signal?: AbortSignal) => request<ApiResponse<Me>>("/me", { signal }),
    /** `PATCH /me`: sửa tên, giới thiệu, ảnh. */
    update: (input: UpdateMeInput) =>
      request<ApiResponse<Me>>("/me", { method: "PATCH", body: input }),
  };
}

export function authApi(request: RequestFn) {
  return {
    /** `GET /auth/providers`: Google/GitHub có bật không, để ẩn nút. */
    providers: (signal?: AbortSignal) =>
      request<ApiResponse<AuthProviders>>("/auth/providers", { signal }),
  };
}
