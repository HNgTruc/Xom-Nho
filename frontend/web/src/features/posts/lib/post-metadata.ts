import type { PostDetail } from "@xom-nho/api";
import type { Metadata } from "next";

/** Thẻ meta khi bài không có hoặc chưa đăng: tiêu đề chung, không cho máy tìm kiếm lập chỉ mục. */
export const HIDDEN_POST_METADATA: Metadata = {
  title: "Bài viết",
  robots: { index: false, follow: false },
};

/** Tiêu đề tab từ tóm tắt: tối đa 60 ký tự, cắt ở ranh giới từ. */
function shortTitle(excerpt: string, max = 60): string {
  const text = excerpt.replace(/…$/, "");
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut}…`;
}

/** Next không gộp sâu `openGraph` của trang với layout gốc: phải ghi lại các trường chung. */
const SITE_OPEN_GRAPH = { siteName: "Xóm Nhỏ", locale: "vi_VN" } as const;

/**
 * Thẻ meta và Open Graph của bài đã đăng (docs/tinh-nang.md mục 2.2: chia sẻ link đẹp).
 * URL tương đối, ghép với `metadataBase` (SITE_URL) ở layout gốc.
 */
export function postMetadata(post: PostDetail): Metadata {
  const url = `/bai-viet/${post.slug}`;
  const description = post.excerpt || undefined;
  // Bài không có tiêu đề (soạn kiểu mạng xã hội): lấy đầu tóm tắt, không có nữa thì "Bài của <tên>"
  const title = post.title || shortTitle(post.excerpt) || `Bài của ${post.author.name}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      type: "article",
      url,
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category.name,
      tags: post.tags.map((tag) => tag.name),
    },
    twitter: { card: "summary", title, description },
  };
}
