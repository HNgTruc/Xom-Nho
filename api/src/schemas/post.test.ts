import { describe, expect, it } from "vitest";
import { slugify } from "../utils/slugify.js";
import {
  pathIdSchema,
  pathSlugSchema,
  pathUsernameSchema,
  slugSchema,
  usernameSchema,
} from "./common.js";
import {
  createPostSchema,
  EMPTY_POST_MESSAGE,
  listPostsQuerySchema,
  updatePostSchema,
} from "./post.js";
import { searchQuerySchema } from "./search.js";
import { tagSuggestQuerySchema } from "./tag.js";

describe("slugSchema", () => {
  it("nhận mọi slug do slugify tạo từ tiếng Việt", () => {
    for (const title of ["Đồ ăn ngon ở Hà Nội!", "Bàn tròn cuối tuần", "Ăn vặt 2026"]) {
      expect(slugSchema.safeParse(slugify(title)).success).toBe(true);
    }
  });

  it("đổi sang chữ thường và bỏ khoảng trắng thừa", () => {
    expect(slugSchema.parse("  Ban-Tron ")).toBe("ban-tron");
  });

  it.each(["", "ban tron", "ban--tron", "-ban", "bàn-tròn", "../admin", "a".repeat(221)])(
    "từ chối %j",
    (value) => {
      expect(slugSchema.safeParse(value).success).toBe(false);
    },
  );
});

describe("usernameSchema", () => {
  it("nhận chữ thường và số", () => {
    expect(usernameSchema.parse("LanAnh2")).toBe("lananh2");
  });

  it.each(["lan-anh", "lan anh", "lân", "a".repeat(21)])("từ chối %j", (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(false);
  });
});

describe("schema đường dẫn (pathSlugSchema, pathUsernameSchema, pathIdSchema)", () => {
  it("nhận đúng dạng chuẩn", () => {
    expect(pathSlugSchema.safeParse(slugify("Bàn tròn cuối tuần")).success).toBe(true);
    expect(pathUsernameSchema.safeParse("lananh2").success).toBe(true);
    expect(pathIdSchema.safeParse("cmh3x9k2a0000qz8l5v7f1b2c").success).toBe(true);
  });

  it.each(["Ban-Tron", " ban-tron", "ban-tron ", "ban tron"])(
    "slug không đổi chữ hoa hay cắt khoảng trắng: từ chối %j",
    (value) => {
      expect(pathSlugSchema.safeParse(value).success).toBe(false);
    },
  );

  it.each(["LanAnh", " lananh", "lan-anh"])("username: từ chối %j", (value) => {
    expect(pathUsernameSchema.safeParse(value).success).toBe(false);
  });

  it.each(["", "a b", "../x", "x".repeat(65)])("id: từ chối %j", (value) => {
    expect(pathIdSchema.safeParse(value).success).toBe(false);
  });
});

describe("listPostsQuerySchema", () => {
  it("query trống thì trang 1, 10 bài, sắp mới nhất", () => {
    expect(listPostsQuerySchema.parse({})).toEqual({ page: 1, pageSize: 10, sort: "new" });
  });

  it("ép chuỗi từ URL sang số và giữ bộ lọc", () => {
    expect(
      listPostsQuerySchema.parse({ page: "3", sort: "top", category: "doi-song", tag: "an-vat" }),
    ).toEqual({ page: 3, pageSize: 10, sort: "top", category: "doi-song", tag: "an-vat" });
  });

  it("bộ lọc rỗng từ URL coi như không lọc", () => {
    const query = listPostsQuerySchema.parse({ category: "", tag: "", author: "" });

    expect(query.category).toBeUndefined();
    expect(query.tag).toBeUndefined();
    expect(query.author).toBeUndefined();
  });

  it("từ chối cách sắp xếp lạ bằng câu tiếng Việt", () => {
    const result = listPostsQuerySchema.safeParse({ sort: "random" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Cách sắp xếp không hợp lệ");
  });

  it("từ chối pageSize quá 50", () => {
    expect(listPostsQuerySchema.safeParse({ pageSize: "51" }).success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("giữ nguyên dấu trong từ khóa (backend mới bỏ dấu), chỉ cắt khoảng trắng", () => {
    expect(searchQuerySchema.parse({ q: "  Đồ ăn  " }).q).toBe("Đồ ăn");
  });

  it("không có q thì q rỗng, không báo lỗi", () => {
    expect(searchQuerySchema.parse({})).toEqual({ page: 1, pageSize: 10, q: "" });
  });

  it("từ chối từ khóa dài quá 100 ký tự", () => {
    expect(searchQuerySchema.safeParse({ q: "a".repeat(101) }).success).toBe(false);
  });
});

describe("tagSuggestQuerySchema", () => {
  it("không có q thì q rỗng", () => {
    expect(tagSuggestQuerySchema.parse({})).toEqual({ q: "" });
  });
});

describe("createPostSchema", () => {
  const base = { category: "doi-song" };

  it("chỉ có nội dung: tiêu đề rỗng, không có ảnh", () => {
    expect(createPostSchema.parse({ ...base, content: "  Chào cả xóm  " })).toEqual({
      title: "",
      content: "Chào cả xóm",
      category: "doi-song",
      mediaIds: [],
    });
  });

  it("chỉ có ảnh, không có chữ vẫn đăng được", () => {
    expect(createPostSchema.safeParse({ ...base, mediaIds: ["abc123"] }).success).toBe(true);
  });

  it("không chữ, không ảnh thì báo ở ô nội dung", () => {
    const result = createPostSchema.safeParse({ ...base, content: "   " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["content"]);
  });

  it.each([undefined, "", "   "])("thiếu danh mục (%j) thì báo chọn danh mục", (category) => {
    const result = createPostSchema.safeParse({ content: "Chào", category });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Chọn danh mục cho bài");
  });

  it("quá 10 ảnh, video thì lỗi", () => {
    const mediaIds = Array.from({ length: 11 }, (_, i) => `m${i}`);
    expect(createPostSchema.safeParse({ ...base, mediaIds }).success).toBe(false);
  });

  it("id ảnh trùng hoặc sai dạng thì lỗi", () => {
    expect(createPostSchema.safeParse({ ...base, mediaIds: ["a", "a"] }).success).toBe(false);
    expect(createPostSchema.safeParse({ ...base, mediaIds: ["../etc"] }).success).toBe(false);
  });

  it("nội dung giữ nguyên xuống dòng và chữ tiếng Việt", () => {
    const content = "Dòng một\n\nĐồ ăn ngon";
    expect(createPostSchema.parse({ ...base, content }).content).toBe(content);
  });

  it("nội dung quá dài thì lỗi", () => {
    expect(createPostSchema.safeParse({ ...base, content: "a".repeat(10_001) }).success).toBe(
      false,
    );
  });
});

describe("updatePostSchema", () => {
  it("chỉ giữ trường được gửi, cắt khoảng trắng như lúc đăng", () => {
    expect(updatePostSchema.parse({ title: "  Chợ phiên  " })).toEqual({ title: "Chợ phiên" });
  });

  it("không gửi trường nào thì báo chưa thay đổi gì", () => {
    const result = updatePostSchema.safeParse({});

    expect(result.error?.issues[0]?.message).toBe("Bạn chưa thay đổi gì");
  });

  it("xóa hết chữ và hết ảnh cùng lúc thì báo ở ô content", () => {
    const result = updatePostSchema.safeParse({ content: "  ", mediaIds: [] });

    expect(result.error?.issues[0]).toMatchObject({
      path: ["content"],
      message: EMPTY_POST_MESSAGE,
    });
  });

  it("xóa hết chữ mà không gửi mediaIds thì để backend xét (bài có thể còn ảnh)", () => {
    expect(updatePostSchema.safeParse({ content: "" }).success).toBe(true);
  });

  it.each<[Record<string, unknown>, string]>([
    [{ mediaIds: ["a", "a"] }, "ảnh trùng"],
    [{ mediaIds: ["../etc"] }, "id lạ"],
    [{ mediaIds: Array.from({ length: 11 }, (_, i) => `m${i}`) }, "quá 10 file"],
    [{ category: "" }, "danh mục rỗng"],
    [{ title: "a".repeat(201) }, "tiêu đề quá dài"],
  ])("chặn %j (%s)", (body) => {
    expect(updatePostSchema.safeParse(body).success).toBe(false);
  });

  it("bỏ trường client không được đổi (slug, status, authorId)", () => {
    expect(
      updatePostSchema.parse({ content: "Mới", slug: "x", status: "PUBLISHED", authorId: "y" }),
    ).toEqual({
      content: "Mới",
    });
  });
});
