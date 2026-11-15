import type { FriendsPageQuery, ListFriendRequestsQuery } from "../schemas/friend.js";
import type { ApiResponse, PaginatedResponse } from "../types/api-response.js";
import type { FriendItem, FriendRequestItem, FriendshipState } from "../types/friend.js";
import type { RequestFn } from "./client.js";

export function friendsApi(request: RequestFn) {
  return {
    /** `GET /friends`: bạn bè của tôi, mới kết bạn trước. */
    list: (query: Partial<FriendsPageQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<FriendItem>>("/friends", { query, signal }),

    /** `GET /friends/requests`: lời mời nhận được (mặc định) hoặc đã gửi (`direction: "outgoing"`). */
    requests: (query: Partial<ListFriendRequestsQuery> = {}, signal?: AbortSignal) =>
      request<PaginatedResponse<FriendRequestItem>>("/friends/requests", { query, signal }),

    /**
     * `PUT /friends/:userId`: gửi lời mời, hoặc chấp nhận nếu người kia đã mời mình. Gọi lặp lại giữ nguyên.
     * Bị chặn, người kia bị cấm: ApiError 403. Gửi dồn dập: ApiError 429.
     */
    add: (userId: string) =>
      request<ApiResponse<FriendshipState>>(`/friends/${encodeURIComponent(userId)}`, {
        method: "PUT",
      }),

    /** `DELETE /friends/:userId`: hủy lời mời đã gửi, từ chối lời mời nhận được, hoặc hủy kết bạn. */
    remove: (userId: string) =>
      request<ApiResponse<FriendshipState>>(`/friends/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      }),
  };
}
