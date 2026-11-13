import type { RequestFn } from "../client.js";
import { adminCommentsApi } from "./comments.js";
import { adminPostsApi } from "./posts.js";
import { adminUsersApi } from "./users.js";

/** Route `/api/v1/admin/*`, chỉ trưởng xóm gọi được (backend trả 403 cho người khác). App admin dùng. */
export function adminApi(request: RequestFn) {
  return {
    posts: adminPostsApi(request),
    comments: adminCommentsApi(request),
    users: adminUsersApi(request),
  };
}
