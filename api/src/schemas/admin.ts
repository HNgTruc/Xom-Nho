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

/**
 * Cách sắp bảng bài của trưởng xóm. `newest`, `oldest`: theo lúc tạo bài. Còn lại: bảng xếp hạng theo một cột
 * (màn Bài viết, chốt 2026-11-13), chiều theo `order`; trùng số thì bài mới hơn trước.
 */
export const ADMIN_POST_SORTS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  LIKES: "likes",
  DISLIKES: "dislikes",
  COMMENTS: "comments",
  VIEWS: "views",
} as const;
export type AdminPostSort = (typeof ADMIN_POST_SORTS)[keyof typeof ADMIN_POST_SORTS];
const ADMIN_POST_SORT_VALUES = Object.values(ADMIN_POST_SORTS) as [
  AdminPostSort,
  ...AdminPostSort[],
];

/** Chiều sắp của bảng xếp hạng: `desc` (cao xuống thấp) mặc định, `asc` là nút đảo chiều. */
export const SORT_ORDERS = { DESC: "desc", ASC: "asc" } as const;
export type SortOrder = (typeof SORT_ORDERS)[keyof typeof SORT_ORDERS];

/** Khoảng thời gian thống kê: bài **đăng** trong 7 ngày, 30 ngày gần nhất, hoặc mọi lúc. */
export const ADMIN_STATS_RANGES = { WEEK: "7d", MONTH: "30d", ALL: "all" } as const;
export type AdminStatsRange = (typeof ADMIN_STATS_RANGES)[keyof typeof ADMIN_STATS_RANGES];
const ADMIN_STATS_RANGE_VALUES = Object.values(ADMIN_STATS_RANGES) as [
  AdminStatsRange,
  ...AdminStatsRange[],
];

/** Số ngày của mỗi khoảng; `all` không giới hạn. */
export const ADMIN_STATS_RANGE_DAYS: Record<AdminStatsRange, number | null> = {
  "7d": 7,
  "30d": 30,
  all: null,
};

/**
 * Màn Tổng quan (`GET /admin/dashboard`): biểu đồ cột `ADMIN_DASHBOARD_DAYS` ngày (tính cả hôm nay), thẻ số liệu
 * so `ADMIN_DASHBOARD_RECENT_DAYS` ngày gần nhất với chừng ấy ngày liền trước. Ngày tính theo giờ Việt Nam.
 */
export const ADMIN_DASHBOARD_DAYS = 30;
export const ADMIN_DASHBOARD_RECENT_DAYS = 7;

/** Ba số liệu theo ngày của màn Tổng quan: bài viết, bình luận, thành viên mới. */
export const ADMIN_DASHBOARD_METRICS = {
  POSTS: "posts",
  COMMENTS: "comments",
  MEMBERS: "members",
} as const;
export type AdminDashboardMetric =
  (typeof ADMIN_DASHBOARD_METRICS)[keyof typeof ADMIN_DASHBOARD_METRICS];
export const ADMIN_DASHBOARD_METRIC_VALUES = Object.values(ADMIN_DASHBOARD_METRICS) as [
  AdminDashboardMetric,
  ...AdminDashboardMetric[],
];

const statsRange = z.enum(ADMIN_STATS_RANGE_VALUES, { error: "Khoảng thời gian không hợp lệ" });

/**
 * Query của `GET /admin/posts`: mọi bài, mọi trạng thái. Sắp theo lúc tạo bài (`newest` mặc định).
 * Màn Bài mới gửi `since` (ISO 8601, mốc lần xem trước) + `sort=oldest`: bài tạo sau mốc, cũ nhất trước.
 * Bảng xếp hạng ở màn Bài viết gửi `range` + `sort=likes|dislikes|comments|views` + `order` + `pageSize=20|30`.
 * `range` bỏ trống thì không lọc theo thời gian; có cả `since` thì lấy mốc muộn hơn.
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
  range: z.preprocess(emptyToUndefined, statsRange.optional()),
  sort: z
    .enum(ADMIN_POST_SORT_VALUES, { error: "Cách sắp xếp không hợp lệ" })
    .default(ADMIN_POST_SORTS.NEWEST),
  order: z
    .enum([SORT_ORDERS.DESC, SORT_ORDERS.ASC], { error: "Chiều sắp xếp không hợp lệ" })
    .default(SORT_ORDERS.DESC),
});

export type AdminListPostsQuery = z.infer<typeof adminListPostsQuerySchema>;

/** Query của `GET /admin/posts/stats`: thẻ số liệu ở màn Bài viết, mặc định 30 ngày. */
export const adminPostStatsQuerySchema = z.object({
  range: statsRange.default(ADMIN_STATS_RANGES.MONTH),
});

export type AdminPostStatsQuery = z.infer<typeof adminPostStatsQuerySchema>;

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
