import { describe, expect, it } from "vitest";
import { initials } from "./initials.js";

describe("initials", () => {
  it("lấy chữ đầu của tên gọi (từ cuối)", () => {
    expect(initials("Nguyễn Lan Anh")).toBe("A");
  });

  it("viết hoa đ thành Đ", () => {
    expect(initials("Trần đào")).toBe("Đ");
  });

  it("giữ dấu khi tên gõ dạng NFD", () => {
    expect(initials("Lê Ánh".normalize("NFD"))).toBe("Á");
  });

  it("bỏ khoảng trắng thừa ở đầu, cuối và giữa các từ", () => {
    expect(initials("  Phạm   Minh  ")).toBe("M");
  });

  it("tên có ký tự đặc biệt thì lấy đúng ký tự đầu của từ cuối", () => {
    expect(initials("Bé #Na")).toBe("#");
  });

  it("tên rỗng hoặc chỉ có khoảng trắng thì ra dấu hỏi", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});
