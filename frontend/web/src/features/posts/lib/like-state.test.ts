import { LIKE_MESSAGES } from "@xom-nho/api";
import { ApiError } from "@xom-nho/api/api-client";
import { describe, expect, it } from "vitest";
import { likeErrorText, toggledLike } from "./like-state";

describe("toggledLike", () => {
  it("chưa thích thì thành đã thích, số thích cộng một", () => {
    expect(toggledLike({ liked: false, likeCount: 3 })).toEqual({ liked: true, likeCount: 4 });
  });

  it("đã thích thì thành bỏ thích, số thích trừ một", () => {
    expect(toggledLike({ liked: true, likeCount: 4 })).toEqual({ liked: false, likeCount: 3 });
  });

  it("số thích không xuống dưới 0 khi dữ liệu lệch", () => {
    expect(toggledLike({ liked: true, likeCount: 0 })).toEqual({ liked: false, likeCount: 0 });
  });
});

describe("likeErrorText", () => {
  it("bấm nhanh quá thì dùng câu của backend", () => {
    const error = new ApiError(429, { code: "RATE_LIMITED", message: LIKE_MESSAGES.RATE_LIMITED });
    expect(likeErrorText(error)).toBe(LIKE_MESSAGES.RATE_LIMITED);
  });

  it("bài đang ẩn thì dùng câu của backend", () => {
    const error = new ApiError(403, { code: "FORBIDDEN", message: LIKE_MESSAGES.POST_CLOSED });
    expect(likeErrorText(error)).toBe(LIKE_MESSAGES.POST_CLOSED);
  });

  it("bài không còn, lỗi máy chủ hay mất mạng thì báo chưa lưu được", () => {
    expect(likeErrorText(new ApiError(404, { code: "NOT_FOUND", message: "x" }))).toBe(
      LIKE_MESSAGES.FAILED,
    );
    expect(likeErrorText(new ApiError(500, { code: "INTERNAL_ERROR", message: "x" }))).toBe(
      LIKE_MESSAGES.FAILED,
    );
    expect(likeErrorText(new TypeError("Failed to fetch"))).toBe(LIKE_MESSAGES.FAILED);
  });
});
