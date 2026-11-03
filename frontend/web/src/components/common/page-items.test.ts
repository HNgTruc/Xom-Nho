import { describe, expect, it } from "vitest";
import { pageItems } from "./page-items";

describe("pageItems", () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [1, 10, [1, 2, "gap", 10]],
    [5, 10, [1, "gap", 4, 5, 6, "gap", 10]],
    [10, 10, [1, "gap", 9, 10]],
    // Chỉ thiếu đúng một số thì hiện số đó, không hiện "…"
    [3, 10, [1, 2, 3, 4, "gap", 10]],
    [4, 6, [1, 2, 3, 4, 5, 6]],
  ])("trang %i / %i", (page, total, expected) => {
    expect(pageItems(page, total)).toEqual(expected);
  });
});
