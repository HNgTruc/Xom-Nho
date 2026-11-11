import { describe, expect, it } from "vitest";
import { DEFAULT_DISPLAY_PREFERENCES, parseDisplayPreferences } from "./display-preferences";

describe("parseDisplayPreferences", () => {
  it("chưa lưu gì thì dùng mặc định: theo thiết bị cả ba mục", () => {
    expect(parseDisplayPreferences(null)).toEqual(DEFAULT_DISPLAY_PREFERENCES);
  });

  it("đọc đúng tùy chọn đã lưu", () => {
    const raw = JSON.stringify({ theme: "dark", transparency: "on", motion: "reduce" });

    expect(parseDisplayPreferences(raw)).toEqual({
      theme: "dark",
      transparency: "on",
      motion: "reduce",
    });
  });

  it("trường nào lạ thì về mặc định trường đó, trường đúng vẫn giữ", () => {
    const raw = JSON.stringify({ theme: "hồng", transparency: "off", motion: 1 });

    expect(parseDisplayPreferences(raw)).toEqual({
      theme: "system",
      transparency: "off",
      motion: "system",
    });
  });

  it.each(["không phải json", "null", "[]", "42"])("chuỗi %j thì dùng mặc định", (raw) => {
    expect(parseDisplayPreferences(raw)).toEqual(DEFAULT_DISPLAY_PREFERENCES);
  });
});
