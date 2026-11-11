import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next.js";

describe("safeNext", () => {
  it("giữ đường dẫn nội bộ", () => {
    expect(safeNext("/viet-bai?nhap=1")).toBe("/viet-bai?nhap=1");
  });

  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", ""])(
    "chặn %j, trả về trang chủ",
    (value) => {
      expect(safeNext(value)).toBe("/");
    },
  );

  it("không có thì dùng giá trị mặc định", () => {
    expect(safeNext(undefined, "/bai-cua-toi")).toBe("/bai-cua-toi");
  });

  it("nhiều giá trị thì lấy cái đầu", () => {
    expect(safeNext(["/a", "/b"])).toBe("/a");
  });
});
