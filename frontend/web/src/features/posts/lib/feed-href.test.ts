import { describe, expect, it } from "vitest";
import { feedHref } from "./feed-href";

describe("feedHref", () => {
  it.each([
    ["new", 1, "/"],
    ["new", 2, "/?page=2"],
    ["top", 1, "/?sort=top"],
    ["top", 3, "/?sort=top&page=3"],
  ] as const)("sort=%s, page=%i thành %s", (sort, page, expected) => {
    expect(feedHref(sort, page)).toBe(expected);
  });
});
