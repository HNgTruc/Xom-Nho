import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from "../schemas/post.js";
import type { ApiResponse, PaginatedResponse } from "../types/api-response.js";
import type { PostDetail, PostLikeState, PostListItem } from "../types/post.js";
import type { RequestFn } from "./client.js";

export function postsApi(request: RequestFn) {
  return {
    /** `GET /posts`: bài đã đăng, có phân trang, lọc theo danh mục, tag, tác giả. */
    list: (query: Partial<ListPostsQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<PostListItem>>("/posts", { query, signal }),

    /** `GET /posts/:slug`: chi tiết bài. Không có hoặc không được xem thì ném ApiError 404. */
    get: (slug: string, signal?: AbortSignal) =>
      request<ApiResponse<PostDetail>>(`/posts/${encodeURIComponent(slug)}`, { signal }),

    /** `POST /posts`: đăng bài soạn kiểu mạng xã hội, đăng thẳng (ADR 0008). Trả bài vừa đăng. */
    create: (input: CreatePostInput) =>
      request<ApiResponse<PostDetail>>("/posts", { method: "POST", body: input }),

    /**
     * `PATCH /posts/:id`: sửa bài của mình, chỉ gửi trường muốn đổi. `mediaIds` là danh sách đầy đủ sau khi sửa.
     * Trả bài sau khi sửa (slug giữ nguyên). Bài của người khác: ApiError 403.
     */
    update: (id: string, input: UpdatePostInput) =>
      request<ApiResponse<PostDetail>>(`/posts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: input,
      }),

    /** `DELETE /posts/:id`: xóa hẳn bài của mình, cả bình luận, ảnh, video. Bài của người khác: ApiError 403. */
    remove: (id: string) => request<void>(`/posts/${encodeURIComponent(id)}`, { method: "DELETE" }),

    /** `POST /posts/:id/view`: tăng lượt xem. Frontend chỉ gọi một lần mỗi phiên cho mỗi bài. */
    view: (id: string) =>
      request<void>(`/posts/${encodeURIComponent(id)}/view`, { method: "POST" }),

    /**
     * `PUT /posts/:id/like`: thích bài. Gọi lặp lại vẫn chỉ tính một lần. Trả số thích mới.
     * Bài chưa đăng hoặc đã ẩn: ApiError 403. Bấm dồn dập: ApiError 429.
     */
    like: (id: string) =>
      request<ApiResponse<PostLikeState>>(`/posts/${encodeURIComponent(id)}/like`, {
        method: "PUT",
      }),

    /** `DELETE /posts/:id/like`: bỏ thích. Chưa thích mà gọi cũng không lỗi. Trả số thích mới. */
    unlike: (id: string) =>
      request<ApiResponse<PostLikeState>>(`/posts/${encodeURIComponent(id)}/like`, {
        method: "DELETE",
      }),

    /**
     * `PUT /posts/:id/dislike`: Không thích bài (ADR 0009). Đang Thích thì tự bỏ Thích. Gọi lặp lại vẫn chỉ tính
     * một lần. Trả cả số thích lẫn số không thích. Bài chưa đăng hoặc đã ẩn: ApiError 403.
     */
    dislike: (id: string) =>
      request<ApiResponse<PostLikeState>>(`/posts/${encodeURIComponent(id)}/dislike`, {
        method: "PUT",
      }),

    /** `DELETE /posts/:id/dislike`: bỏ Không thích. Chưa bấm mà gọi cũng không lỗi. */
    undislike: (id: string) =>
      request<ApiResponse<PostLikeState>>(`/posts/${encodeURIComponent(id)}/dislike`, {
        method: "DELETE",
      }),
  };
}
