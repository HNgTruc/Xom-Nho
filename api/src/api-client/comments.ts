import type { CreateCommentInput, UpdateCommentInput } from "../schemas/comment.js";
import type { ApiResponse } from "../types/api-response.js";
import type { CommentItem, CommentThread } from "../types/comment.js";
import type { RequestFn } from "./client.js";

export function commentsApi(request: RequestFn) {
  return {
    /** `GET /posts/:postId/comments`: các nhánh bình luận của bài. Bài không có hoặc không xem được: ApiError 404. */
    list: (postId: string, signal?: AbortSignal) =>
      request<ApiResponse<CommentThread[]>>(`/posts/${encodeURIComponent(postId)}/comments`, {
        signal,
      }),

    /** `POST /posts/:postId/comments`: bình luận hoặc trả lời (`parentId`). Gửi dồn dập: ApiError 429. */
    create: (postId: string, input: CreateCommentInput) =>
      request<ApiResponse<CommentItem>>(`/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        body: input,
      }),

    /** `PATCH /comments/:id`: sửa bình luận của mình. Của người khác: ApiError 403. */
    update: (id: string, input: UpdateCommentInput) =>
      request<ApiResponse<CommentItem>>(`/comments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: input,
      }),

    /** `DELETE /comments/:id`: xóa bình luận của mình, các trả lời bên dưới bị xóa theo. */
    remove: (id: string) =>
      request<void>(`/comments/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}
