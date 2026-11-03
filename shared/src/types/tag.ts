/** `GET /tags?q=` (gợi ý) và `GET /tags/:slug` (tiêu đề trang tag). */
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** Tag gắn trên bài: chỉ cần tên và slug để dựng liên kết `/tag/<slug>`. */
export type TagRef = Pick<Tag, "name" | "slug">;
