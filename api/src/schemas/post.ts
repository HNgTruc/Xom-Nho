import { z } from "zod";
import { POST_SORTS, POST_SORT_VALUES } from "../constants/post-sorts.js";
import { optionalSlugFilter, optionalUsernameFilter } from "./common.js";
import { paginationQuerySchema } from "./pagination.js";

/**
 * Query của `GET /posts`: trang chủ, trang danh mục, trang tag, bài trên hồ sơ.
 * Chỉ trả bài đã đăng; lọc nào để trống thì bỏ qua.
 */
export const listPostsQuerySchema = paginationQuerySchema.extend({
  category: optionalSlugFilter,
  tag: optionalSlugFilter,
  author: optionalUsernameFilter,
  sort: z.enum(POST_SORT_VALUES, { error: "Cách sắp xếp không hợp lệ" }).default(POST_SORTS.NEW),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
