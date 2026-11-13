import { describe, expect, it } from "vitest";
import { ADMIN_MESSAGES } from "../constants/messages.js";
import {
  adminListCommentsQuerySchema,
  adminListPostsQuerySchema,
  adminListUsersQuerySchema,
  archivePostSchema,
  banUserSchema,
  setUserRoleSchema,
} from "./admin.js";

describe("adminListPostsQuerySchema", () => {
  it("mặc định trang 1, 20 dòng, mới nhất trước, không lọc", () => {
    expect(adminListPostsQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 20,
      sort: "newest",
    });
  });

  it("ô lọc rỗng từ URL coi như không lọc", () => {
    const query = adminListPostsQuerySchema.parse({ status: "", q: "", since: "", author: "" });
    expect(query).toEqual({ page: 1, pageSize: 20, sort: "newest" });
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
