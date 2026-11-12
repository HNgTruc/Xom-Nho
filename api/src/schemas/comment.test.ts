import { describe, expect, it } from "vitest";
import { LIMITS } from "../constants/limits.js";
import { COMMENT_MESSAGES } from "../constants/messages.js";
import { createCommentSchema, updateCommentSchema } from "./comment.js";

describe("createCommentSchema", () => {
  it("cắt khoảng trắng hai đầu, giữ xuống dòng và dấu tiếng Việt", () => {
    const result = createCommentSchema.parse({ content: "  Đồng ý!\nMai gặp nhé đ/Đ  " });

    expect(result).toEqual({ content: "Đồng ý!\nMai gặp nhé đ/Đ" });
  });

  it.each(["", "   ", "\n\t "])("nội dung rỗng %j bị từ chối, báo tiếng Việt", (content) => {
    const result = createCommentSchema.safeParse({ content });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(COMMENT_MESSAGES.EMPTY);
  });

  it("thiếu content báo cùng câu với nội dung rỗng", () => {
    const result = createCommentSchema.safeParse({});

    expect(result.error?.issues[0]?.message).toBe(COMMENT_MESSAGES.EMPTY);
  });

  it("dài đúng giới hạn thì được, quá một ký tự thì không", () => {
    expect(createCommentSchema.safeParse({ content: "a".repeat(LIMITS.COMMENT_MAX) }).success).toBe(
      true,
    );
    const tooLong = createCommentSchema.safeParse({ content: "a".repeat(LIMITS.COMMENT_MAX + 1) });
    expect(tooLong.error?.issues[0]?.message).toBe(COMMENT_MESSAGES.TOO_LONG);
  });

  it("nhận parentId dạng id, chặn id lạ", () => {
    expect(createCommentSchema.parse({ content: "ok", parentId: "cmabc123" })).toEqual({
      content: "ok",
      parentId: "cmabc123",
    });
    expect(createCommentSchema.safeParse({ content: "ok", parentId: "../x" }).success).toBe(false);
  });

  it("bỏ trường lạ client gửi (authorId, status)", () => {
    const result = createCommentSchema.parse({ content: "ok", authorId: "khac", status: "HIDDEN" });

    expect(result).toEqual({ content: "ok" });
  });
});

describe("updateCommentSchema", () => {
  it("chỉ nhận content, không đổi được parentId", () => {
    expect(updateCommentSchema.parse({ content: " sửa ", parentId: "x" })).toEqual({
      content: "sửa",
    });
  });
});
