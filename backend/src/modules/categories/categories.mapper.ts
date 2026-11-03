import type { Category } from "@xom-nho/shared";
import type { CategoryListRow } from "./categories.repository.js";

export function toCategory(row: CategoryListRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    postCount: row._count.posts,
  };
}
