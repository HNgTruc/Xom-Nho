import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { POST_SORTS, POST_SORT_VALUES } from "../constants/post-sorts.js";
import { optionalSlugFilter, optionalUsernameFilter, pathIdSchema, slugSchema } from "./common.js";
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

/**
 * Body của `POST /posts`: bài soạn kiểu mạng xã hội (docs/tinh-nang.md mục 2.3). Ai cũng đăng thẳng (ADR 0008).
 * - `title` tùy chọn: bỏ trống thì thẻ bài hiện phần đầu nội dung.
 * - `content` là chữ thường (giữ xuống dòng), không phải Markdown.
 * - `mediaIds`: id do `POST /files` trả về, theo thứ tự hiển thị, tối đa `LIMITS.POST_MEDIA_MAX`.
 * Phải có nội dung hoặc ít nhất một ảnh, video.
 */
export const createPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(LIMITS.POST_TITLE_MAX, `Tiêu đề tối đa ${LIMITS.POST_TITLE_MAX} ký tự`)
      .default(""),
    content: z
      .string()
      .trim()
      .max(LIMITS.POST_PLAIN_CONTENT_MAX, `Nội dung tối đa ${LIMITS.POST_PLAIN_CONTENT_MAX} ký tự`)
      .default(""),
    category: z
      .string({ error: "Chọn danh mục cho bài" })
      .trim()
      .min(1, "Chọn danh mục cho bài")
      .pipe(slugSchema),
    mediaIds: z
      .array(pathIdSchema, { error: "Danh sách ảnh, video không hợp lệ" })
      .max(LIMITS.POST_MEDIA_MAX, `Mỗi bài tối đa ${LIMITS.POST_MEDIA_MAX} ảnh, video`)
      .refine((ids) => new Set(ids).size === ids.length, "Ảnh, video bị trùng")
      .default([]),
  })
  .refine((input) => input.content !== "" || input.mediaIds.length > 0, {
    path: ["content"],
    message: "Viết vài dòng hoặc thêm ảnh, video cho bài nhé.",
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
