import { baseSlug, excerptFromContent } from "./posts.compose.js";

describe("excerptFromContent", () => {
  it("nội dung ngắn giữ nguyên, gộp xuống dòng và khoảng trắng", () => {
    expect(excerptFromContent("Chào  cả xóm\n\nHôm nay trời đẹp")).toBe(
      "Chào cả xóm Hôm nay trời đẹp",
    );
  });

  it("dài quá thì cắt ở ranh giới từ, thêm dấu …, không quá giới hạn", () => {
    const content = "Đồ ăn đường phố ".repeat(20);
    const excerpt = excerptFromContent(content, 40);

    expect(excerpt.length).toBeLessThanOrEqual(40);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt).not.toMatch(/\s…$/);
    expect(content.startsWith(excerpt.slice(0, -1))).toBe(true);
  });

  it("nội dung rỗng thì tóm tắt rỗng", () => {
    expect(excerptFromContent("   ")).toBe("");
  });
});

describe("baseSlug", () => {
  it("lấy từ tiêu đề nếu có", () => {
    expect(baseSlug("Bàn tròn cuối tuần", "Nội dung")).toBe("ban-tron-cuoi-tuan");
  });

  it("không có tiêu đề thì lấy từ đầu nội dung, tối đa 60 ký tự", () => {
    const slug = baseSlug(
      "",
      "Hôm nay xóm mình có chợ phiên ở đầu ngõ, ai rảnh thì ghé chơi nhé, vui lắm",
    );
    expect(slug.startsWith("hom-nay-xom-minh-co-cho-phien")).toBe(true);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug).not.toMatch(/-$/);
  });

  it("cắt ở ranh giới từ, không cắt giữa chữ", () => {
    const slug = baseSlug(
      "",
      "Chợ phiên đầu ngõ sáng nay vui lắm cả xóm ơi! Ai rảnh chiều ghé chơi nhé.",
    );
    expect(slug).toBe("cho-phien-dau-ngo-sang-nay-vui-lam-ca-xom-oi-ai-ranh-chieu");
  });

  it("chỉ có ảnh hoặc toàn ký tự đặc biệt thì dùng bai-viet", () => {
    expect(baseSlug("", "")).toBe("bai-viet");
    expect(baseSlug("", "🎉🎉🎉 !!!")).toBe("bai-viet");
  });
});
