import type { ApiResponse } from "../types/api-response.js";
import type { PublicProfile } from "../types/user.js";
import type { RequestFn } from "./client.js";

export function usersApi(request: RequestFn) {
  return {
    /**
     * `GET /users/:username`: hồ sơ công khai. Không có thì ném ApiError 404.
     * Bài của người này: `api.posts.list({ author: username })`.
     */
    get: (username: string, signal?: AbortSignal) =>
      request<ApiResponse<PublicProfile>>(`/users/${encodeURIComponent(username)}`, { signal }),
  };
}
