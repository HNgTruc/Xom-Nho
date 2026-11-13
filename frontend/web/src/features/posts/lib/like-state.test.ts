import { DISLIKE_MESSAGES, LIKE_MESSAGES, type PostLikeState } from "@xom-nho/api";
import { ApiError } from "@xom-nho/api/api-client";
import { describe, expect, it } from "vitest";
import { likeErrorText, sameLikeState, toggledDislike, toggledLike } from "./like-state";

const state = (overrides: Partial<PostLikeState> = {}): PostLikeState => ({
  liked: false,
  likeCount: 0,
  disliked: false,
  dislikeCount: 0,
  ...overrides,
});

describe("toggledLike", () => {
  it("chưa thích thì thành đã thích, số thích cộng một", () => {
    expect(toggledLike(state({ likeCount: 3 }))).toEqual(state({ liked: true, likeCount: 4 }));
  });

  it("đã thích thì thành bỏ thích, số thích trừ một", () => {
    expect(toggledLike(state({ liked: true, likeCount: 4 }))).toEqual(state({ likeCount: 3 }));
  });

  it("số thích không xuống dưới 0 khi dữ liệu lệch", () => {
    expect(toggledLike(state({ liked: true }))).toEqual(state());
  });

  it("đang Không thích mà bấm Thích thì gỡ Không thích (loại trừ nhau)", () => {
    expect(toggledLike(state({ disliked: true, dislikeCount: 2, likeCount: 1 }))).toEqual(
      state({ liked: true, likeCount: 2, dislikeCount: 1 }),
    );
  });
});

describe("toggledDislike", () => {
  it("chưa bấm thì thành Không thích, số cộng một", () => {
    expect(toggledDislike(state({ dislikeCount: 1 }))).toEqual(
      state({ disliked: true, dislikeCount: 2 }),
    );
  });

  it("bấm lại thì bỏ Không thích, số trừ một, không xuống dưới 0", () => {
    expect(toggledDislike(state({ disliked: true, dislikeCount: 2 }))).toEqual(
      state({ dislikeCount: 1 }),
    );
    expect(toggledDislike(state({ disliked: true }))).toEqual(state());
  });

  it("đang Thích mà bấm Không thích thì gỡ Thích", () => {
    expect(toggledDislike(state({ liked: true, likeCount: 5 }))).toEqual(
      state({ likeCount: 4, disliked: true, dislikeCount: 1 }),
    );
  });
});

describe("likeErrorText", () => {
  it("bấm nhanh quá thì dùng câu của backend", () => {
    const error = new ApiError(429, { code: "RATE_LIMITED", message: LIKE_MESSAGES.RATE_LIMITED });
    expect(likeErrorText(error)).toBe(LIKE_MESSAGES.RATE_LIMITED);
  });

  it("bài đang ẩn thì dùng câu của backend", () => {
    const error = new ApiError(403, { code: "FORBIDDEN", message: DISLIKE_MESSAGES.POST_CLOSED });
    expect(likeErrorText(error, "dislike")).toBe(DISLIKE_MESSAGES.POST_CLOSED);
  });

  it("bài không còn, lỗi máy chủ hay mất mạng thì báo chưa lưu được, theo đúng nút đã bấm", () => {
    expect(likeErrorText(new ApiError(404, { code: "NOT_FOUND", message: "x" }))).toBe(
      LIKE_MESSAGES.FAILED,
    );
    expect(likeErrorText(new ApiError(500, { code: "INTERNAL_ERROR", message: "x" }))).toBe(
      LIKE_MESSAGES.FAILED,
    );
    expect(likeErrorText(new TypeError("Failed to fetch"), "dislike")).toBe(
      DISLIKE_MESSAGES.FAILED,
    );
  });
});

describe("sameLikeState", () => {
  it("so cả bốn trường", () => {
    expect(sameLikeState(state(), state())).toBe(true);
    expect(sameLikeState(state(), state({ dislikeCount: 1 }))).toBe(false);
  });
});
