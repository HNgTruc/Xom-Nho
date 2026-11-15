import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Khóa query danh mục ở trang quản trị. Bộ lọc danh mục ở màn Bài viết dùng khóa `["categories"]` riêng. */
export const adminCategoriesKeys = {
  all: ["admin", "categories"] as const,
};

/** Mọi danh mục theo thứ tự menu Chủ đề (vài chục dòng, không phân trang). */
export const adminCategoriesQuery = queryOptions({
  queryKey: adminCategoriesKeys.all,
  queryFn: async ({ signal }) => (await api.admin.categories.list(signal)).data,
});
