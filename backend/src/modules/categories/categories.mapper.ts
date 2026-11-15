import { type AdminCategory, type Category, toCategoryColor, toCategoryIcon } from "@xom-nho/api";
import type { AdminCategoryRow, CategoryListRow } from "./categories.repository.js";

export function toCategory(row: CategoryListRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    color: toCategoryColor(row.color),
    icon: toCategoryIcon(row.icon),
    postCount: row._count.posts,
  };
}

export function toAdminCategory(row: AdminCategoryRow): AdminCategory {
  return { ...toCategory(row), totalPostCount: row.totalPosts };
}
