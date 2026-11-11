import type { PostDetail } from "@xom-nho/api";
import type { Metadata } from "next";

/** Thẻ meta khi bài không có hoặc chưa đăng: tiêu đề chung, không cho máy tìm kiếm lập chỉ mục. */
export const HIDDEN_POST_METADATA: Metadata = {
  title: "Bài viết",
  robots: { index: false, follow: false },
};

/** Next không gộp sâu `openGraph` của trang với layout gốc: phải ghi lại các trường chung. */
const SITE_OPEN_GRAPH = { siteName: "Xóm Nhỏ", locale: "vi_VN" } as const;

/**
 * Thẻ meta và Open Graph của bài đã đăng (docs/tinh-nang.md mục 2.2: chia sẻ link đẹp).
 * URL tương đối, ghép với `metadataBase` (SITE_URL) ở layout gốc.
 */
export function postMetadata(post: PostDetail): Metadata {
  const url = `/bai-viet/${post.slug}`;
  const description = post.excerpt || undefined;
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      type: "article",
      url,
      title: post.title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category.name,
      tags: post.tags.map((tag) => tag.name),
    },
    twitter: { card: "summary", title: post.title, description },
  };
}
