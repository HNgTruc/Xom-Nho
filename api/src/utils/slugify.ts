import { LIMITS } from "../constants/limits.js";
import { removeVietnameseTones } from "./remove-vietnamese-tones.js";

/**
 * Tạo slug cho URL từ tiêu đề tiếng Việt: "Đồ ăn ngon ở Hà Nội!" → "do-an-ngon-o-ha-noi".
 * Chỉ giữ a-z, 0-9 và dấu gạch ngang. Chuỗi không còn ký tự nào hợp lệ thì trả về "".
 * Slug trùng thì backend thêm hậu tố bằng `withSlugSuffix`.
 */
export function slugify(text: string, maxLength: number = LIMITS.SLUG_MAX): string {
  return removeVietnameseTones(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

/** Slug thứ n khi bị trùng: `withSlugSuffix("ban-tron", 2)` → "ban-tron-2". Vẫn giữ trong giới hạn độ dài. */
export function withSlugSuffix(
  slug: string,
  n: number,
  maxLength: number = LIMITS.SLUG_MAX,
): string {
  const suffix = `-${n}`;
  return `${slug.slice(0, maxLength - suffix.length).replace(/-+$/, "")}${suffix}`;
}
