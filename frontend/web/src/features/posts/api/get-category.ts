import type { Category } from "@xom-nho/api";
import { cache } from "react";
import { publicApi } from "@/lib/server-api";

/**
 * Tất cả danh mục theo thứ tự hiển thị. `cache`: header, cột phải và trang danh mục dùng chung một lần gọi
 * trong cùng request. Lỗi ném tiếp; chỗ chỉ là phần phụ (header, cột phải) tự bắt và hiện rỗng.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  const { data } = await publicApi.categories.list();
  return data;
});

/**
 * Một danh mục theo slug, cho trang `/danh-muc/<slug>`. Backend chưa có `GET /categories/:slug`, nhưng danh mục
 * chỉ có vài cái nên lấy cả danh sách rồi tìm. So khớp chính xác: `Doi-Song` là 404, mỗi trang một URL
 * (docs/api.md).
 */
export async function getCategory(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}
