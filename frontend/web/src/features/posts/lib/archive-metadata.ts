import type { Category, Tag } from "@xom-nho/api";
import type { Metadata } from "next";

/** Thẻ meta khi danh mục hoặc thẻ không có: tiêu đề chung, không cho máy tìm kiếm lập chỉ mục. */
export const ARCHIVE_NOT_FOUND_METADATA: Metadata = {
  title: "Không tìm thấy",
  robots: { index: false, follow: false },
};

/** Next không gộp sâu `openGraph` của trang với layout gốc: phải ghi lại các trường chung. */
const SITE_OPEN_GRAPH = { siteName: "Xóm Nhỏ", locale: "vi_VN" } as const;

function archiveMetadata(title: string, description: string, url: string): Metadata {
  return {
    title,
    description,
    openGraph: { ...SITE_OPEN_GRAPH, type: "website", url, title, description },
    twitter: { card: "summary", title, description },
  };
}

/** Trang `/danh-muc/<slug>`. Danh mục không có mô tả thì dùng câu chung. */
export function categoryMetadata(category: Category): Metadata {
  const description =
    category.description?.trim() || `Bài viết trong danh mục ${category.name} trên Xóm Nhỏ.`;
  return archiveMetadata(category.name, description, `/danh-muc/${category.slug}`);
}

/** Trang `/tag/<slug>`. */
export function tagMetadata(tag: Tag): Metadata {
  return archiveMetadata(
    `Thẻ ${tag.name}`,
    `Bài viết gắn thẻ ${tag.name} trên Xóm Nhỏ.`,
    `/tag/${tag.slug}`,
  );
}
