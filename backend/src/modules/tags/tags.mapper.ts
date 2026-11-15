import type { AdminTag, Tag } from "@xom-nho/api";
import type { AdminTagRow, TagRow } from "./tags.repository.js";

export function toTag(row: TagRow): Tag {
  return { id: row.id, name: row.name, slug: row.slug };
}

export function toAdminTag(row: AdminTagRow): AdminTag {
  return { ...toTag(row), postCount: row._count.posts, createdAt: row.createdAt.toISOString() };
}
