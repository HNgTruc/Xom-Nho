import { describe, expect, it } from "vitest";
import { slugify, withSlugSuffix } from "./slugify.js";

describe("slugify", () => {
  it("tạo slug từ tiêu đề tiếng Việt", () => {
    expect(slugify("Đồ ăn ngon ở Hà Nội!")).toBe("do-an-ngon-o-ha-noi");
  });

  it("gộp khoảng trắng và ký tự đặc biệt liên tiếp thành một gạch ngang", () => {
    expect(slugify("  Hỏi   đáp -- (kinh nghiệm) & mẹo  ")).toBe("hoi-dap-kinh-nghiem-meo");
  });

  it("xử lý chuỗi NFD", () => {
    expect(slugify("Góc kể chuyện".normalize("NFD"))).toBe("goc-ke-chuyen");
  });

  it("giữ chữ số", () => {
    expect(slugify("Top 10 quán phở 2026")).toBe("top-10-quan-pho-2026");
  });

  it("trả chuỗi rỗng khi không còn ký tự hợp lệ", () => {
    expect(slugify("!!! ??? ...")).toBe("");
  });

  it("cắt theo độ dài tối đa và không để gạch ngang ở cuối", () => {
    expect(slugify("bàn tròn cuối tuần", 9)).toBe("ban-tron");
  });
});

describe("withSlugSuffix", () => {
  it("thêm hậu tố số", () => {
    expect(withSlugSuffix("ban-tron", 2)).toBe("ban-tron-2");
  });

  it("vẫn nằm trong độ dài tối đa", () => {
    const result = withSlugSuffix("ban-tron-cuoi", 12, 12);
    expect(result).toBe("ban-tron-12");
    expect(result.length).toBeLessThanOrEqual(12);
  });
});
