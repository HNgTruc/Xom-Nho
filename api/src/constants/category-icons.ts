/**
 * Khóa biểu tượng của danh mục (MASTER mục 6 "Biểu tượng danh mục"). Đặt theo hình vẽ, không theo tên danh mục
 * (giống khóa màu): đổi tên hay thêm danh mục chỉ cần chọn lại khóa. Hình vẽ nằm ở `ui` (`CategoryIcon`).
 * Thêm biểu tượng mới: vẽ trong `frontend/ui/src/components/category-icon.tsx` trước, rồi thêm khóa vào đây.
 */
export const CATEGORY_ICONS = {
  /** Chén trà bốc khói */
  TEA: "tea",
  /** Con chip */
  CHIP: "chip",
  /** Quyển vở mở */
  NOTEBOOK: "notebook",
  /** Trăng khuyết và vì sao */
  MOON: "moon",
  /** Bong bóng có dấu hỏi */
  QUESTION: "question",
} as const;

export type CategoryIcon = (typeof CATEGORY_ICONS)[keyof typeof CATEGORY_ICONS];

export const CATEGORY_ICON_VALUES = Object.values(CATEGORY_ICONS) as [
  CategoryIcon,
  ...CategoryIcon[],
];

/**
 * Đổi giá trị bất kỳ về một khóa biểu tượng hợp lệ. Không có, hoặc khóa lạ (biểu tượng mới mà app bản cũ
 * chưa biết) thì trả `null`: giao diện hiện chấm màu của danh mục.
 */
export function toCategoryIcon(value: string | null | undefined): CategoryIcon | null {
  return value && (CATEGORY_ICON_VALUES as readonly string[]).includes(value)
    ? (value as CategoryIcon)
    : null;
}
