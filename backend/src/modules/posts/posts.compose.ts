import { LIMITS, slugify } from "@xom-nho/api";

/** Slug khi bài không có chữ nào dùng được (chỉ có ảnh, hoặc toàn ký tự đặc biệt). */
export const FALLBACK_POST_SLUG = "bai-viet";

/** Độ dài slug lấy từ nội dung khi không có tiêu đề: vài từ đầu là đủ nhận ra bài. */
const CONTENT_SLUG_MAX = 60;

/**
 * Tóm tắt cho thẻ bài và tìm kiếm: nội dung gộp khoảng trắng, tối đa 160 ký tự, cắt ở ranh giới từ và thêm "…".
 */
export function excerptFromContent(content: string, max: number = LIMITS.POST_EXCERPT_MAX): string {
  const flat = content.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Slug gốc (chưa xử lý trùng): từ tiêu đề, không có thì từ đầu nội dung, không có nữa thì "bai-viet". */
export function baseSlug(title: string, content: string): string {
  return slugify(title) || slugFromContent(content) || FALLBACK_POST_SLUG;
}

/** Vài từ đầu của nội dung, tối đa 60 ký tự, cắt ở ranh giới từ (không để "...-ghe" thành "...-g"). */
function slugFromContent(content: string): string {
  const full = slugify(content.slice(0, CONTENT_SLUG_MAX * 4));
  if (full.length <= CONTENT_SLUG_MAX) return full;
  const cut = full.slice(0, CONTENT_SLUG_MAX + 1);
  const lastDash = cut.lastIndexOf("-");
  return lastDash > 0 ? cut.slice(0, lastDash) : full.slice(0, CONTENT_SLUG_MAX);
}
