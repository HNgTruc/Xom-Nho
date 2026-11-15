import type { CategoryColor, CategoryIcon } from "@xom-nho/api";

/** Tên màu bằng chữ (pages/admin.md "Danh mục": màu không chỉ dựa vào mắt nhìn). */
export const COLOR_LABELS: Record<CategoryColor, string> = {
  amber: "Hổ phách",
  blue: "Xanh dương",
  green: "Xanh lá",
  purple: "Tím",
  rose: "Hồng",
};

/** Tên hình vẽ, cho nút chọn biểu tượng chỉ có hình (MASTER mục 6 "Biểu tượng danh mục"). */
export const ICON_LABELS: Record<CategoryIcon, string> = {
  tea: "Chén trà",
  chip: "Con chip",
  notebook: "Quyển vở",
  moon: "Trăng và sao",
  question: "Bong bóng hỏi",
};

export const NO_ICON_LABEL = "Không có biểu tượng (hiện chấm màu)";
