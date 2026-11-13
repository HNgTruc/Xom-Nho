import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { ADMIN_MESSAGES } from "../constants/messages.js";
import { ROLE_VALUES } from "../constants/roles.js";
import { COMMENT_STATUS_VALUES, POST_STATUS_VALUES } from "../constants/statuses.js";
import { optionalSlugFilter, optionalUsernameFilter, pathIdSchema } from "./common.js";

/** Ô lọc rỗng từ URL (`?status=`) coi như không lọc. */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

/** Phân trang của trang quản trị: mặc định 20 dòng, tối đa 100 (pages/admin.md: chọn 20, 50, 100 dòng). */
const adminPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Số trang bắt đầu từ 1").default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1, "Mỗi trang cần ít nhất 1 mục")
    .max(LIMITS.ADMIN_PAGE_SIZE_MAX, `Mỗi trang tối đa ${LIMITS.ADMIN_PAGE_SIZE_MAX} mục`)
    .default(LIMITS.ADMIN_PAGE_SIZE_DEFAULT),
});

/** Từ khóa tìm trong bảng quản trị; rỗng thì bỏ qua. */
const adminSearchQuery = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(LIMITS.SEARCH_QUERY_MAX, `Từ khóa tối đa ${LIMITS.SEARCH_QUERY_MAX} ký tự`)
    .optional(),
);

/** Lý do ẩn bài, cấm thành viên: bắt buộc, cắt khoảng trắng, tối đa `LIMITS.MODERATION_REASON_MAX`. */
function moderationReason(required: string, tooLong: string) {
  return z
    .string({ error: required })
    .trim()
    .min(1, required)
    .max(LIMITS.MODERATION_REASON_MAX, tooLong);
}

export const ADMIN_POST_SORTS = { NEWEST: "newest", OLDEST: "oldest" } as const;
export type AdminPostSort = (typeof ADMIN_POST_SORTS)[keyof typeof ADMIN_POST_SORTS];

/**
 * Query của `GET /admin/posts`: mọi bài, mọi trạng thái. Sắp theo lúc tạo bài (`newest` mặc định).
 * Màn Bài mới gửi `since` (ISO 8601, mốc lần xem trước) + `sort=oldest`: bài tạo sau mốc, cũ nhất trước.
 */
export const adminListPostsQuerySchema = adminPaginationQuerySchema.extend({
  status: z.preprocess(
    emptyToUndefined,
    z.enum(POST_STATUS_VALUES, { error: "Trạng thái không hợp lệ" }).optional(),
  ),
  category: optionalSlugFilter,
  author: optionalUsernameFilter,
  q: adminSearchQuery,
  since: z.preprocess(
    emptyToUndefined,
    z.iso.datetime({ offset: true, error: ADMIN_MESSAGES.SINCE_INVALID }).optional(),
  ),
  sort: z
    .enum([ADMIN_POST_SORTS.NEWEST, ADMIN_POST_SORTS.OLDEST], {
      error: "Cách sắp xếp không hợp lệ",
    })
    .default(ADMIN_POST_SORTS.NEWEST),
});

export type AdminListPostsQuery = z.infer<typeof adminListPostsQuerySchema>;

/** Body của `POST /admin/posts/:id/archive`: lý do bắt buộc, tác giả thấy (pages/admin.md mục "Ẩn bài"). */
export const archivePostSchema = z.object({
  reason: moderationReason(
    ADMIN_MESSAGES.HIDE_REASON_REQUIRED,
    ADMIN_MESSAGES.HIDE_REASON_TOO_LONG,
  ),
});

export type ArchivePostInput = z.infer<typeof archivePostSchema>;

/** Query của `GET /admin/comments`: mọi bình luận, mới nhất trước. `post` là id bài. */
export const adminListCommentsQuerySchema = adminPaginationQuerySchema.extend({
  status: z.preprocess(
    emptyToUndefined,
    z.enum(COMMENT_STATUS_VALUES, { error: "Trạng thái không hợp lệ" }).optional(),
  ),
  post: z.preprocess(emptyToUndefined, pathIdSchema.optional()),
  author: optionalUsernameFilter,
  q: adminSearchQuery,
});

export type AdminListCommentsQuery = z.infer<typeof adminListCommentsQuerySchema>;

/** Query của `GET /admin/users`: tìm theo tên, email; lọc vai trò, đang bị cấm (`banned=true|false`). */
export const adminListUsersQuerySchema = adminPaginationQuerySchema.extend({
  role: z.preprocess(
    emptyToUndefined,
    z.enum(ROLE_VALUES, { error: "Vai trò không hợp lệ" }).optional(),
  ),
  banned: z.preprocess(
    emptyToUndefined,
    z
      .enum(["true", "false"], { error: "Bộ lọc cấm không hợp lệ" })
      .transform((value) => value === "true")
      .optional(),
  ),
  q: adminSearchQuery,
});

export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;

/** Body của `PATCH /admin/users/:id/role`. */
export const setUserRoleSchema = z.object({
  role: z.enum(ROLE_VALUES, { error: "Vai trò không hợp lệ" }),
});

export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;

/**
 * Body của `POST /admin/users/:id/ban`. `expiresAt` (ISO 8601) phải sau lúc gửi; không gửi hoặc `null` là cấm
 * vĩnh viễn. Backend kiểm tra lại mốc thời gian theo đồng hồ của server.
 */
export const banUserSchema = z.object({
  reason: moderationReason(ADMIN_MESSAGES.BAN_REASON_REQUIRED, ADMIN_MESSAGES.BAN_REASON_TOO_LONG),
  expiresAt: z.iso
    .datetime({ offset: true, error: ADMIN_MESSAGES.BAN_EXPIRES_INVALID })
    .nullable()
    .optional()
    .refine((value) => value == null || new Date(value).getTime() > Date.now(), {
      message: ADMIN_MESSAGES.BAN_EXPIRES_PAST,
    }),
});

export type BanUserInput = z.infer<typeof banUserSchema>;
