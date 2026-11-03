/** Phần tử của `GET /api/v1/categories`. */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Số bài đã đăng trong danh mục. */
  postCount: number;
}
