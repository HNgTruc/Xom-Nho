import type { CategoryColor } from "../constants/category-colors.js";

/** Phần tử của `GET /api/v1/categories`. */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Khóa màu badge (MASTER mục 2.2). Client gặp giá trị lạ thì dùng `toCategoryColor` (về màu mặc định). */
  color: CategoryColor;
  /** Số bài đã đăng trong danh mục. */
  postCount: number;
}
