import { describe, expect, it } from "vitest";
import { removeVietnameseTones, toSearchText } from "./remove-vietnamese-tones.js";

describe("removeVietnameseTones", () => {
  it("bỏ đủ năm dấu thanh và dấu mũ, dấu móc", () => {
    expect(removeVietnameseTones("bàn tròn ăn uống ở phường")).toBe("ban tron an uong o phuong");
  });

  it("đổi đ/Đ thành d/D", () => {
    expect(removeVietnameseTones("Đồ ăn đường phố")).toBe("Do an duong pho");
  });

  it("giữ nguyên chữ hoa", () => {
    expect(removeVietnameseTones("HÀ NỘI Mùa Thu")).toBe("HA NOI Mua Thu");
  });

  it("xử lý chuỗi tổ hợp NFD giống chuỗi dựng sẵn NFC", () => {
    const nfd = "Tiếng Việt".normalize("NFD");
    expect(removeVietnameseTones(nfd)).toBe("Tieng Viet");
  });

  it("không đổi chuỗi không dấu và ký tự đặc biệt", () => {
    expect(removeVietnameseTones("abc 123 !?#")).toBe("abc 123 !?#");
  });
});

describe("toSearchText", () => {
  it("bỏ dấu, chữ thường, gộp khoảng trắng thừa", () => {
    expect(toSearchText("  Bàn   Tròn\n\tCuối Tuần ")).toBe("ban tron cuoi tuan");
  });

  it("từ khóa không dấu khớp với nội dung có dấu", () => {
    expect(toSearchText("do an")).toBe(toSearchText("Đồ Ăn"));
  });
});
