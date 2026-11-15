import { describe, expect, it } from "vitest";
import { ADMIN_MESSAGES } from "../constants/messages.js";
import {
  adminListCommentsQuerySchema,
  adminListPostsQuerySchema,
  adminListUsersQuerySchema,
  adminPostStatsQuerySchema,
  adminListTagsQuerySchema,
  archivePostSchema,
  banUserSchema,
  categoryInputSchema,
  mergeTagSchema,
  reorderCategoriesSchema,
  setUserRoleSchema,
} from "./admin.js";

describe("adminListPostsQuerySchema", () => {
  it("mặc định trang 1, 20 dòng, mới nhất trước, không lọc", () => {
    expect(adminListPostsQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
      sort: "newest",
      order: "desc",
    });
  });

  it("nhận bảng xếp hạng: khoảng thời gian, sắp theo cột, đảo chiều, 30 dòng", () => {
    expect(
      adminListPostsQuerySchema.parse({
        range: "7d",
        sort: "dislikes",
        order: "asc",
        pageSize: "30",
      }),
    ).toEqual({ page: 1, pageSize: 30, range: "7d", sort: "dislikes", order: "asc" });
  });

  it.each([
    ["range", "90d"],
    ["sort", "shares"],
    ["order", "up"],
  ])("từ chối %s=%j", (key, value) => {
    expect(adminListPostsQuerySchema.safeParse({ [key]: value }).success).toBe(false);
  });

  it("ô lọc rỗng từ URL coi như không lọc", () => {
    const query = adminListPostsQuerySchema.parse({
      status: "",
      q: "",
      since: "",
      author: "",
      range: "",
    });
    expect(query).toEqual({ page: 1, pageSize: 20, sort: "newest", order: "desc" });
  });

  it("nhận màn Bài mới: since ISO 8601 có múi giờ, cũ nhất trước", () => {
    const query = adminListPostsQuerySchema.parse({
      since: "2026-11-13T07:00:00.000Z",
      sort: "oldest",
      status: "PUBLISHED",
    });
    expect(query).toMatchObject({ since: "2026-11-13T07:00:00.000Z", sort: "oldest" });
  });

  it.each(["hôm qua", "2026-11-13", "1731481200000"])("từ chối since %j", (since) => {
    const result = adminListPostsQuerySchema.safeParse({ since });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.SINCE_INVALID);
  });

  it("từ chối trạng thái lạ và quá 100 dòng mỗi trang", () => {
    expect(adminListPostsQuerySchema.safeParse({ status: "DELETED" }).success).toBe(false);
    expect(adminListPostsQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);
  });

  it("cắt khoảng trắng ở từ khóa", () => {
    expect(adminListPostsQuerySchema.parse({ q: "  Bánh mì  " }).q).toBe("Bánh mì");
  });
});

describe("adminPostStatsQuerySchema", () => {
  it("mặc định 30 ngày, nhận 7 ngày và tất cả", () => {
    expect(adminPostStatsQuerySchema.parse({})).toEqual({ range: "30d" });
    expect(adminPostStatsQuerySchema.parse({ range: "all" })).toEqual({ range: "all" });
    expect(adminPostStatsQuerySchema.safeParse({ range: "1y" }).success).toBe(false);
  });
});

describe("archivePostSchema", () => {
  it("cắt khoảng trắng hai đầu lý do", () => {
    expect(archivePostSchema.parse({ reason: "  Quảng cáo, rao vặt  " })).toEqual({
      reason: "Quảng cáo, rao vặt",
    });
  });

  it.each([{}, { reason: "" }, { reason: "   " }])("thiếu lý do (%j) thì báo ghi lý do", (body) => {
    const result = archivePostSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.HIDE_REASON_REQUIRED);
  });

  it("lý do quá 500 ký tự thì báo dài quá", () => {
    const result = archivePostSchema.safeParse({ reason: "đ".repeat(501) });
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.HIDE_REASON_TOO_LONG);
  });
});

describe("adminListCommentsQuerySchema", () => {
  it("lọc theo trạng thái và id bài", () => {
    expect(adminListCommentsQuerySchema.parse({ status: "HIDDEN", post: "cm123abc" })).toEqual({
      page: 1,
      pageSize: 20,
      status: "HIDDEN",
      post: "cm123abc",
    });
  });

  it("từ chối id bài sai dạng", () => {
    expect(adminListCommentsQuerySchema.safeParse({ post: "../admin" }).success).toBe(false);
  });
});

describe("adminListUsersQuerySchema", () => {
  it.each([
    ["true", true],
    ["false", false],
  ])("banned=%s thành %s", (banned, expected) => {
    expect(adminListUsersQuerySchema.parse({ banned }).banned).toBe(expected);
  });

  it("từ chối giá trị banned khác true/false và vai trò lạ", () => {
    expect(adminListUsersQuerySchema.safeParse({ banned: "yes" }).success).toBe(false);
    expect(adminListUsersQuerySchema.safeParse({ role: "moderator" }).success).toBe(false);
  });
});

describe("setUserRoleSchema", () => {
  it("chỉ nhận ba vai trò của Xóm Nhỏ", () => {
    expect(setUserRoleSchema.parse({ role: "author" })).toEqual({ role: "author" });
    expect(setUserRoleSchema.safeParse({ role: "superadmin" }).success).toBe(false);
  });
});

describe("banUserSchema", () => {
  it("không có hạn là cấm vĩnh viễn", () => {
    expect(banUserSchema.parse({ reason: "Spam" })).toEqual({ reason: "Spam" });
    expect(banUserSchema.parse({ reason: "Spam", expiresAt: null })).toEqual({
      reason: "Spam",
      expiresAt: null,
    });
  });

  it("nhận hạn cấm trong tương lai", () => {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(banUserSchema.parse({ reason: "Spam", expiresAt })).toEqual({
      reason: "Spam",
      expiresAt,
    });
  });

  it("hạn cấm đã qua thì báo phải sau hiện tại", () => {
    const result = banUserSchema.safeParse({
      reason: "Spam",
      expiresAt: "2020-01-01T00:00:00.000Z",
    });
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.BAN_EXPIRES_PAST);
  });

  it("hạn cấm sai dạng thì báo không hợp lệ", () => {
    const result = banUserSchema.safeParse({ reason: "Spam", expiresAt: "7 ngày" });
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.BAN_EXPIRES_INVALID);
  });

  it("thiếu lý do thì báo ghi lý do cấm", () => {
    const result = banUserSchema.safeParse({ reason: " " });
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.BAN_REASON_REQUIRED);
  });
});

describe("categoryInputSchema", () => {
  const valid = { name: "  Đời sống ", description: "", color: "amber", icon: null };

  it("cắt khoảng trắng tên, mô tả rỗng thành null, biểu tượng được null", () => {
    expect(categoryInputSchema.parse(valid)).toEqual({
      name: "Đời sống",
      description: null,
      color: "amber",
      icon: null,
    });
  });

  it("không gửi mô tả cũng thành null; mô tả có chữ thì giữ (đã cắt khoảng trắng)", () => {
    const { description: _, ...withoutDescription } = valid;
    expect(categoryInputSchema.parse(withoutDescription).description).toBeNull();
    expect(
      categoryInputSchema.parse({ ...valid, description: " Chuyện thường ngày " }).description,
    ).toBe("Chuyện thường ngày");
  });

  it("tên rỗng hoặc chỉ có khoảng trắng: báo đặt tên", () => {
    const result = categoryInputSchema.safeParse({ ...valid, name: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(ADMIN_MESSAGES.CATEGORY_NAME_REQUIRED);
  });

  it("tên quá 50 ký tự, mô tả quá 300 ký tự: báo lỗi", () => {
    expect(
      categoryInputSchema.safeParse({ ...valid, name: "đ".repeat(51) }).error?.issues[0]?.message,
    ).toBe(ADMIN_MESSAGES.CATEGORY_NAME_TOO_LONG);
    expect(
      categoryInputSchema.safeParse({ ...valid, description: "a".repeat(301) }).error?.issues[0]
        ?.message,
    ).toBe(ADMIN_MESSAGES.CATEGORY_DESCRIPTION_TOO_LONG);
  });

  it("màu, biểu tượng ngoài danh sách: báo lỗi", () => {
    expect(
      categoryInputSchema.safeParse({ ...valid, color: "red" }).error?.issues[0]?.message,
    ).toBe(ADMIN_MESSAGES.CATEGORY_COLOR_INVALID);
    expect(
      categoryInputSchema.safeParse({ ...valid, icon: "star" }).error?.issues[0]?.message,
    ).toBe(ADMIN_MESSAGES.CATEGORY_ICON_INVALID);
  });
});

describe("reorderCategoriesSchema", () => {
  it("nhận danh sách id không trùng", () => {
    expect(reorderCategoriesSchema.parse({ ids: ["a1", "b2"] })).toEqual({ ids: ["a1", "b2"] });
  });

  it.each([[[]], [["a1", "a1"]], [["../x"]]])("từ chối %j", (ids) => {
    expect(reorderCategoriesSchema.safeParse({ ids }).success).toBe(false);
  });
});

describe("adminListTagsQuerySchema, mergeTagSchema", () => {
  it("mặc định trang 1, 20 dòng, nhiều bài trước; ô tìm rỗng bỏ qua", () => {
    expect(adminListTagsQuerySchema.parse({ q: "" })).toEqual({
      page: 1,
      pageSize: 20,
      sort: "posts",
    });
    expect(adminListTagsQuerySchema.parse({ q: " an vat ", sort: "name" })).toMatchObject({
      q: "an vat",
      sort: "name",
    });
  });

  it("cách sắp lạ: báo lỗi; gộp cần id thẻ đích hợp lệ", () => {
    expect(adminListTagsQuerySchema.safeParse({ sort: "random" }).success).toBe(false);
    expect(mergeTagSchema.safeParse({ targetId: "../x" }).success).toBe(false);
    expect(mergeTagSchema.parse({ targetId: "t1" })).toEqual({ targetId: "t1" });
  });
});
