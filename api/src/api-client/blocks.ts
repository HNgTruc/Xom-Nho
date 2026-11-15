import type { FriendsPageQuery } from "../schemas/friend.js";
import type { ApiResponse, PaginatedResponse } from "../types/api-response.js";
import type { BlockedItem, FriendshipState } from "../types/friend.js";
import type { RequestFn } from "./client.js";

export function blocksApi(request: RequestFn) {
  return {
    /** `GET /blocks`: người tôi đã chặn, mới trước (phần Đã chặn ở trang cài đặt). */
    list: (query: Partial<FriendsPageQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<BlockedItem>>("/blocks", { query, signal }),

    /** `PUT /blocks/:userId`: chặn; quan hệ bạn bè, lời mời giữa hai người bị xóa. Chặn lặp lại không lỗi. */
    block: (userId: string) =>
      request<ApiResponse<FriendshipState>>(`/blocks/${encodeURIComponent(userId)}`, {
        method: "PUT",
      }),

    /** `DELETE /blocks/:userId`: bỏ chặn. Quan hệ bạn bè không tự quay lại. */
    unblock: (userId: string) =>
      request<ApiResponse<FriendshipState>>(`/blocks/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      }),
  };
}
