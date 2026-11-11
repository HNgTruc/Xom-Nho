import { categoriesApi } from "./categories.js";
import { type ClientOptions, createRequest } from "./client.js";
import { filesApi } from "./files.js";
import { healthApi } from "./health.js";
import { authApi, meApi } from "./me.js";
import { postsApi } from "./posts.js";
import { searchApi } from "./search.js";
import { tagsApi } from "./tags.js";
import { usersApi } from "./users.js";

/**
 * API client có kiểu cho `/api/v1`. Mỗi frontend tạo một client với cấu hình riêng:
 *
 *   const api = createClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL!, credentials: "include" });
 *   const { data } = await api.categories.list();
 */
export function createClient(options: ClientOptions) {
  const request = createRequest(options);
  return {
    request,
    health: healthApi(request),
    categories: categoriesApi(request),
    posts: postsApi(request),
    files: filesApi(request),
    tags: tagsApi(request),
    users: usersApi(request),
    search: searchApi(request),
    me: meApi(request),
    auth: authApi(request),
  };
}

export type ApiClient = ReturnType<typeof createClient>;

export { ApiError, isApiError } from "./api-error.js";
export type { ClientOptions, QueryValue, RequestFn, RequestOptions } from "./client.js";
export { fileUrl } from "./files.js";
