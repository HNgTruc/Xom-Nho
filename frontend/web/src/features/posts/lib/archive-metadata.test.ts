import type { Category, Tag } from "@xom-nho/api";
import { describe, expect, it } from "vitest";
import { categoryMetadata, tagMetadata } from "./archive-metadata";

const category: Category = {
  id: "c1",
  name: "Đời sống",
  slug: "doi-song",
  description: "Chuyện thường ngày trong xóm.",
  color: "amber",
  icon: "tea",
  postCount: 3,
};

const tag: Tag = { id: "t1", name: "Đồ ăn", slug: "do-an" };

describe("categoryMetadata", () => {
  it("dùng tên và mô tả của danh mục, Open Graph trỏ về trang danh mục", () => {
    const metadata = categoryMetadata(category);

    expect(metadata.title).toBe("Đời sống");
    expect(metadata.description).toBe("Chuyện thường ngày trong xóm.");
    expect(metadata.openGraph).toMatchObject({
      siteName: "Xóm Nhỏ",
      locale: "vi_VN",
      url: "/danh-muc/doi-song",
      title: "Đời sống",
    });
  });

  it.each([null, "", "   "])("mô tả %j thì dùng câu chung", (description) => {
    const metadata = categoryMetadata({ ...category, description });

    expect(metadata.description).toBe("Bài viết trong danh mục Đời sống trên Xóm Nhỏ.");
  });
});

describe("tagMetadata", () => {
  it("tiêu đề có chữ Thẻ, Open Graph trỏ về trang thẻ", () => {
    const metadata = tagMetadata(tag);

    expect(metadata.title).toBe("Thẻ Đồ ăn");
    expect(metadata.description).toBe("Bài viết gắn thẻ Đồ ăn trên Xóm Nhỏ.");
    expect(metadata.openGraph).toMatchObject({ url: "/tag/do-an", siteName: "Xóm Nhỏ" });
  });
});
