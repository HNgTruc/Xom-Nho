import { describe, expect, it } from "vitest";
import { feedHref } from "./feed-href";

describe("feedHref", () => {
  it.each([
    ["new", 1, "/"],
    ["new", 2, "/?page=2"],
    ["top", 1, "/?sort=top"],
    ["top", 3, "/?sort=top&page=3"],
  ] as const)("trang chủ: sort=%s, page=%i thành %s", (sort, page, expected) => {
    expect(feedHref(sort, page)).toBe(expected);
  });

  it.each([
    ["new", 1, "/danh-muc/doi-song"],
    ["new", 2, "/danh-muc/doi-song?page=2"],
    ["top", 1, "/danh-muc/doi-song?sort=top"],
    ["top", 4, "/danh-muc/doi-song?sort=top&page=4"],
  ] as const)("có đường dẫn gốc: sort=%s, page=%i thành %s", (sort, page, expected) => {
    expect(feedHref(sort, page, "/danh-muc/doi-song")).toBe(expected);
  });
});
