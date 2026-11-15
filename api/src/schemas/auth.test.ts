import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema, updateMeSchema } from "./auth.js";

describe("signUpSchema", () => {
  it("chuẩn hóa email về chữ thường, bỏ khoảng trắng ở tên", () => {
    const result = signUpSchema.parse({
      name: "  Lan Anh ",
      email: " Lan@Gmail.COM ",
      password: "matkhau123",
    });

    expect(result).toEqual({ name: "Lan Anh", email: "lan@gmail.com", password: "matkhau123" });
  });

  it("báo lỗi tiếng Việt khi mật khẩu ngắn hơn 8 ký tự", () => {
    const result = signUpSchema.safeParse({ name: "Lan", email: "lan@x.vn", password: "1234567" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Mật khẩu cần ít nhất 8 ký tự");
  });

  it("báo lỗi khi email sai định dạng", () => {
    const result = signUpSchema.safeParse({
      name: "Lan",
      email: "lan-at-x",
      password: "matkhau123",
    });

    expect(result.error?.issues[0]?.message).toBe("Email chưa đúng định dạng");
  });
});

describe("signInSchema", () => {
  it("chỉ cần mật khẩu không rỗng", () => {
    expect(signInSchema.safeParse({ email: "a@b.vn", password: "x" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "a@b.vn", password: "" }).success).toBe(false);
  });
});

describe("updateMeSchema", () => {
  it("cho sửa từng trường riêng", () => {
    expect(updateMeSchema.parse({ bio: "Thích nấu ăn" })).toEqual({ bio: "Thích nấu ăn" });
  });

  it("chuỗi rỗng ở giới thiệu và ảnh nghĩa là xóa", () => {
    expect(updateMeSchema.parse({ bio: "  ", image: "" })).toEqual({ bio: null, image: null });
  });

  it("chặn ảnh không phải http(s)", () => {
    expect(updateMeSchema.safeParse({ image: "javascript:alert(1)" }).success).toBe(false);
    expect(updateMeSchema.safeParse({ image: "https://anh.vn/a.png" }).success).toBe(true);
  });

  it("nơi ở cắt khoảng trắng hai đầu, giữ nguyên dấu tiếng Việt", () => {
    expect(updateMeSchema.parse({ location: "  Quận 3, TP.HCM  " })).toEqual({
      location: "Quận 3, TP.HCM",
    });
    expect(updateMeSchema.parse({ location: "Đà Lạt" })).toEqual({ location: "Đà Lạt" });
  });

  it("nơi ở rỗng hay null nghĩa là xóa", () => {
    expect(updateMeSchema.parse({ location: "   " })).toEqual({ location: null });
    expect(updateMeSchema.parse({ location: null })).toEqual({ location: null });
  });

  it("nơi ở quá 100 ký tự thì báo lỗi", () => {
    const result = updateMeSchema.safeParse({ location: "a".repeat(101) });
    expect(result.error?.issues[0]?.message).toBe("Nơi ở tối đa 100 ký tự");
  });

  it("không gửi gì thì báo chưa thay đổi", () => {
    expect(updateMeSchema.safeParse({}).error?.issues[0]?.message).toBe("Bạn chưa thay đổi gì");
  });
});
