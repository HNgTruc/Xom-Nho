import type { CategoryColor } from "../constants/category-colors.js";
import type { CategoryIcon } from "../constants/category-icons.js";

/** Phần tử của `GET /api/v1/categories`. */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Khóa màu badge (MASTER mục 2.2). Client gặp giá trị lạ thì dùng `toCategoryColor` (về màu mặc định). */
  color: CategoryColor;
  /** Khóa biểu tượng (MASTER mục 6). `null`: chưa có, giao diện hiện chấm màu. Client gặp khóa lạ thì dùng `toCategoryIcon`. */
  icon: CategoryIcon | null;
  /** Số bài đã đăng trong danh mục. */
  postCount: number;
}
