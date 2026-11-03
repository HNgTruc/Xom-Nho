import { z } from "zod";
import { LIMITS } from "../constants/limits.js";

/** Query của `GET /tags?q=`: gợi ý tag khi gõ ở trình soạn bài. `q` rỗng thì trả tag dùng nhiều nhất. */
export const tagSuggestQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(LIMITS.TAG_NAME_MAX, `Tên tag tối đa ${LIMITS.TAG_NAME_MAX} ký tự`)
    .default(""),
});

export type TagSuggestQuery = z.infer<typeof tagSuggestQuerySchema>;
