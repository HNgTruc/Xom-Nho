import type { PostDetail } from "@xom-nho/api";
import { describe, expect, it } from "vitest";
import { postMetadata } from "./post-metadata";

const post: PostDetail = {
  id: "p1",
  title: "Bàn tròn cuối tuần",
  slug: "ban-tron-cuoi-tuan",
  excerpt: "Món ngon dễ nấu",
  publishedAt: "2026-11-01T08:00:00.000Z",
  viewCount: 3,
  commentCount: 0,
  author: { id: "u1", name: "Lan Anh", username: "lananh", image: null },
  category: { name: "Đời sống", slug: "doi-song", color: "amber" },
  tags: [{ name: "Ăn vặt", slug: "an-vat" }],
  content: "# Xin chào",
  status: "PUBLISHED",
  rejectReason: null,
  updatedAt: "2026-11-02T09:30:00.000Z",
};

describe("postMetadata", () => {
  it("tiêu đề, mô tả, canonical và Open Graph kiểu bài viết", () => {
    expect(postMetadata(post)).toMatchObject({
      title: "Bàn tròn cuối tuần",
      description: "Món ngon dễ nấu",
      alternates: { canonical: "/bai-viet/ban-tron-cuoi-tuan" },
      openGraph: {
        siteName: "Xóm Nhỏ",
        locale: "vi_VN",
        type: "article",
        url: "/bai-viet/ban-tron-cuoi-tuan",
        publishedTime: "2026-11-01T08:00:00.000Z",
        authors: ["Lan Anh"],
        section: "Đời sống",
        tags: ["Ăn vặt"],
      },
    });
  });

  it("tóm tắt rỗng thì không đặt mô tả (dùng mô tả chung của trang)", () => {
    expect(postMetadata({ ...post, excerpt: "" }).description).toBeUndefined();
  });

  it("không đưa nội dung bài vào thẻ meta", () => {
    expect(JSON.stringify(postMetadata(post))).not.toContain("Xin chào");
  });
});
