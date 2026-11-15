import type { UpdateMeInput } from "../schemas/auth.js";
import type { ListMyPostsQuery } from "../schemas/post.js";
import type { ApiResponse, PaginatedResponse } from "../types/api-response.js";
import type { AuthProviders, Me } from "../types/me.js";
import type { MyPostListItem } from "../types/post.js";
import type { RequestFn } from "./client.js";

export function meApi(request: RequestFn) {
  return {
    /** `GET /me`: người đang đăng nhập. Chưa đăng nhập thì ném ApiError 401. */
    get: (signal?: AbortSignal) => request<ApiResponse<Me>>("/me", { signal }),
    /**
     * `PATCH /me`: sửa tên, giới thiệu, nơi ở, ảnh. `{ image: null }` xóa ảnh đại diện (cả ảnh đã tải lên),
     * `{ location: null }` xóa nơi ở.
     */
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
    /**
     * `PUT /me/cover`: đổi ảnh bìa hồ sơ, trường `file`. Như ảnh đại diện: chỉ ảnh JPG, PNG, WebP đến 5 MB;
     * ảnh cũ bị xóa. File sai loại, quá cỡ: ApiError 400.
     */
    uploadCover: (file: Blob, filename = "cover", signal?: AbortSignal) => {
      const formData = new FormData();
      formData.append("file", file, filename);
      return request<ApiResponse<Me>>("/me/cover", { method: "PUT", formData, signal });
    },
    /** `DELETE /me/cover`: bỏ ảnh bìa, xóa file. Chưa có ảnh bìa cũng không lỗi. */
    removeCover: () => request<ApiResponse<Me>>("/me/cover", { method: "DELETE" }),
    /** `GET /me/posts`: bài của mình, mọi trạng thái, mới tạo trước; `status` để lọc một trạng thái. */
    posts: (query: Partial<ListMyPostsQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<MyPostListItem>>("/me/posts", { query, signal }),
  };
}

export function authApi(request: RequestFn) {
  return {
    /** `GET /auth/providers`: Google/GitHub có bật không, để ẩn nút. */
    providers: (signal?: AbortSignal) =>
      request<ApiResponse<AuthProviders>>("/auth/providers", { signal }),
  };
}
