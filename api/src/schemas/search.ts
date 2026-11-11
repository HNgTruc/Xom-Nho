import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { optionalSlugFilter } from "./common.js";
import { paginationQuerySchema } from "./pagination.js";

/**
 * Query của `GET /search`. Có dấu hay không dấu đều được: backend bỏ dấu bằng `toSearchText`.
 * `q` rỗng không báo lỗi mà trả danh sách rỗng, và không chạm database.
 */
export const searchQuerySchema = paginationQuerySchema.extend({
  q: z
    .string()
    .trim()
    .max(LIMITS.SEARCH_QUERY_MAX, `Từ khóa tối đa ${LIMITS.SEARCH_QUERY_MAX} ký tự`)
    .default(""),
  category: optionalSlugFilter,
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
