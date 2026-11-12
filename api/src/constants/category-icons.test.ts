import { describe, expect, it } from "vitest";
import { toCategoryIcon } from "./category-icons.js";

describe("toCategoryIcon", () => {
  it.each(["tea", "chip", "notebook", "moon", "question"])(
    "giữ nguyên biểu tượng hợp lệ %s",
    (icon) => {
      expect(toCategoryIcon(icon)).toBe(icon);
    },
  );

  it.each([null, undefined, "", "house", "TEA"])(
    "không có hoặc khóa lạ %j thì trả null",
    (icon) => {
      expect(toCategoryIcon(icon)).toBeNull();
    },
  );
});
