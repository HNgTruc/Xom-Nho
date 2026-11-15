import type { RequestFn } from "../client.js";
import { adminCategoriesApi } from "./categories.js";
import { adminCommentsApi } from "./comments.js";
import { adminDashboardApi } from "./dashboard.js";
import { adminPostsApi } from "./posts.js";
import { adminTagsApi } from "./tags.js";
import { adminUsersApi } from "./users.js";

/** Route `/api/v1/admin/*`, chỉ trưởng xóm gọi được (backend trả 403 cho người khác). App admin dùng. */
export function adminApi(request: RequestFn) {
  return {
    dashboard: adminDashboardApi(request),
    posts: adminPostsApi(request),
    comments: adminCommentsApi(request),
    users: adminUsersApi(request),
    categories: adminCategoriesApi(request),
    tags: adminTagsApi(request),
  };
}
