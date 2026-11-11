import type { Category, Tag } from "@xom-nho/api";
import { publicApi } from "@/lib/server-api";
import { getCategories } from "./get-category";

export interface FeedSidebarData {
  categories: Category[];
  tags: Tag[];
}

/** Danh mục và tag dùng nhiều nhất cho cột phải. Chỉ là phần phụ: lỗi thì trả rỗng, không làm hỏng trang. */
export async function getFeedSidebar(): Promise<FeedSidebarData> {
  const [categories, tags] = await Promise.all([
    getCategories().catch(() => []),
    publicApi.tags
      .suggest("")
      .then((res) => res.data)
      .catch(() => []),
  ]);
  return { categories, tags };
}
