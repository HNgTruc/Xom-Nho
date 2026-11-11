import { type Category, toCategoryColor } from "@xom-nho/api";
import type { CategoryListRow } from "./categories.repository.js";

export function toCategory(row: CategoryListRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    color: toCategoryColor(row.color),
    postCount: row._count.posts,
  };
}
