import { describe, expect, it } from "vitest";
import { toCategoryColor } from "./category-colors.js";

describe("toCategoryColor", () => {
  it.each(["amber", "blue", "green", "purple", "rose"])("giữ nguyên màu hợp lệ %s", (color) => {
    expect(toCategoryColor(color)).toBe(color);
  });

  it.each(["teal", "", "AMBER"])("màu lạ %j thì về amber", (color) => {
    expect(toCategoryColor(color)).toBe("amber");
  });
});
