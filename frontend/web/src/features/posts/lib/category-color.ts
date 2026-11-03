import { type CategoryColor, toCategoryColor } from "@xom-nho/shared";

// Viết đủ tên class (không ghép chuỗi) để Tailwind tìm thấy. Màu và tương phản: MASTER mục 2.2.
// Hover giữ nguyên nền (đổi nền sẽ mất màu danh mục), badge tự gạch chân để báo bấm được.
const BADGE_CLASS: Record<CategoryColor, string> = {
  amber: "bg-category-amber-bg text-category-amber hover:bg-category-amber-bg",
  blue: "bg-category-blue-bg text-category-blue hover:bg-category-blue-bg",
  green: "bg-category-green-bg text-category-green hover:bg-category-green-bg",
  purple: "bg-category-purple-bg text-category-purple hover:bg-category-purple-bg",
  rose: "bg-category-rose-bg text-category-rose hover:bg-category-rose-bg",
};

const DOT_CLASS: Record<CategoryColor, string> = {
  amber: "bg-category-amber",
  blue: "bg-category-blue",
  green: "bg-category-green",
  purple: "bg-category-purple",
  rose: "bg-category-rose",
};

/** Màu lạ (backend thêm màu mới mà web chưa biết) thì về màu mặc định, không vỡ giao diện. */
export function categoryBadgeClass(color: string): string {
  return BADGE_CLASS[toCategoryColor(color)];
}

export function categoryDotClass(color: string): string {
  return DOT_CLASS[toCategoryColor(color)];
}
