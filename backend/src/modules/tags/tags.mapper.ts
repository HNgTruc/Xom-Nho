import type { Tag } from "@xom-nho/shared";
import type { TagRow } from "./tags.repository.js";

export function toTag(row: TagRow): Tag {
  return { id: row.id, name: row.name, slug: row.slug };
}
