import { colors, fontSize } from "@xom-nho/ui/tokens";
import { describe, expect, it } from "vitest";
import { getColors, text, weight } from "./index";

describe("theme của app", () => {
  it("dùng đúng bộ màu sáng/tối của ui", () => {
    expect(getColors("light")).toBe(colors.light);
    expect(getColors("dark")).toBe(colors.dark);
  });

  it("chưa biết chế độ của hệ thống thì dùng màu sáng", () => {
    expect(getColors(null)).toBe(colors.light);
    expect(getColors(undefined)).toBe(colors.light);
  });

  it("đổi cỡ chữ token sang fontSize/lineHeight của React Native", () => {
    expect(text.base).toEqual({
      fontSize: fontSize.base.size,
      lineHeight: fontSize.base.lineHeight,
    });
    expect(Object.keys(text)).toEqual(Object.keys(fontSize));
  });

  it("fontWeight là chuỗi", () => {
    expect(weight.semibold).toBe("600");
  });
});
