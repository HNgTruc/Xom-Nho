import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it.each([
    ["Nguyễn Lan Anh", "A"],
    ["đào", "Đ"],
    ["  Minh  ", "M"],
    ["", "?"],
  ])("%j thành %j", (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});
