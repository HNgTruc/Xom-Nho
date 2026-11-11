/**
 * Khóa màu của danh mục (MASTER mục 2.2). Đặt theo sắc độ, không theo tên danh mục: đổi tên hay thêm danh mục
 * không phải sửa token. Màu thật nằm ở `ui` (`--category-<khóa>`, `--category-<khóa>-bg`).
 * Thêm màu thứ sáu: tính tương phản cả hai chế độ trước, rồi thêm vào đây và `frontend/ui/src/styles/theme.css`.
 */
export const CATEGORY_COLORS = {
  AMBER: "amber",
  BLUE: "blue",
  GREEN: "green",
  PURPLE: "purple",
  ROSE: "rose",
} as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[keyof typeof CATEGORY_COLORS];

export const CATEGORY_COLOR_VALUES = Object.values(CATEGORY_COLORS) as [
  CategoryColor,
  ...CategoryColor[],
];

/** Màu lạ (dữ liệu cũ, hoặc màu mới mà app bản cũ chưa biết) thì dùng màu này. */
export const CATEGORY_COLOR_FALLBACK: CategoryColor = CATEGORY_COLORS.AMBER;

/** Đổi giá trị bất kỳ về một khóa màu hợp lệ. */
export function toCategoryColor(value: string): CategoryColor {
  return (CATEGORY_COLOR_VALUES as readonly string[]).includes(value)
    ? (value as CategoryColor)
    : CATEGORY_COLOR_FALLBACK;
}
