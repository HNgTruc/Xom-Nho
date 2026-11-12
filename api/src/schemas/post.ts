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

/** Bài không có chữ lẫn ảnh, video (lúc đăng, hoặc sửa xong còn trống). Backend dùng cùng câu khi kiểm tra sau sửa. */
export const EMPTY_POST_MESSAGE = "Viết vài dòng hoặc thêm ảnh, video cho bài nhé.";

// Các trường của bài, dùng chung cho đăng bài và sửa bài để hai bên cùng một quy tắc
const postTitle = z
  .string()
  .trim()
  .max(LIMITS.POST_TITLE_MAX, `Tiêu đề tối đa ${LIMITS.POST_TITLE_MAX} ký tự`);
const postContent = z
  .string()
  .trim()
  .max(LIMITS.POST_PLAIN_CONTENT_MAX, `Nội dung tối đa ${LIMITS.POST_PLAIN_CONTENT_MAX} ký tự`);
const postCategory = z
  .string({ error: "Chọn danh mục cho bài" })
  .trim()
  .min(1, "Chọn danh mục cho bài")
  .pipe(slugSchema);
const postMediaIds = z
  .array(pathIdSchema, { error: "Danh sách ảnh, video không hợp lệ" })
  .max(LIMITS.POST_MEDIA_MAX, `Mỗi bài tối đa ${LIMITS.POST_MEDIA_MAX} ảnh, video`)
  .refine((ids) => new Set(ids).size === ids.length, "Ảnh, video bị trùng");

/**
 * Body của `POST /posts`: bài soạn kiểu mạng xã hội (docs/tinh-nang.md mục 2.3). Ai cũng đăng thẳng (ADR 0008).
 * - `title` tùy chọn: bỏ trống thì thẻ bài hiện phần đầu nội dung.
 * - `content` là chữ thường (giữ xuống dòng), không phải Markdown.
 * - `mediaIds`: id do `POST /files` trả về, theo thứ tự hiển thị, tối đa `LIMITS.POST_MEDIA_MAX`.
 * Phải có nội dung hoặc ít nhất một ảnh, video.
 */
export const createPostSchema = z
  .object({
    title: postTitle.default(""),
    content: postContent.default(""),
    category: postCategory,
    mediaIds: postMediaIds.default([]),
  })
  .refine((input) => input.content !== "" || input.mediaIds.length > 0, {
    path: ["content"],
    message: EMPTY_POST_MESSAGE,
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;

/**
 * Body của `PATCH /posts/:id`: sửa bài của mình (docs/tinh-nang.md mục 2.3). Chỉ gửi trường muốn đổi.
 * - `mediaIds`: danh sách **đầy đủ** sau khi sửa, theo thứ tự hiển thị. File bỏ ra bị xóa khỏi ổ đĩa;
 *   file mới phải là file vừa tải lên (`POST /files`) của chính mình, chưa gắn bài nào.
 * - Đường dẫn (slug) giữ nguyên dù đổi tiêu đề, để liên kết đã chia sẻ không hỏng.
 * Sửa xong vẫn phải còn chữ hoặc ảnh, video (backend kiểm tra vì cần dữ liệu đang có).
 */
export const updatePostSchema = z
  .object({
    title: postTitle.optional(),
    content: postContent.optional(),
    category: postCategory.optional(),
    mediaIds: postMediaIds.optional(),
  })
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    "Bạn chưa thay đổi gì",
  )
  .refine(
    (input) => input.content !== "" || input.mediaIds === undefined || input.mediaIds.length > 0,
    {
      path: ["content"],
      message: EMPTY_POST_MESSAGE,
    },
  );

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
