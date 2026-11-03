import { Injectable } from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

export const tagSelect = { id: true, name: true, slug: true } satisfies Prisma.TagSelect;

export type TagRow = Prisma.TagGetPayload<{ select: typeof tagSelect }>;

export interface TagSuggestFilter {
  /** Từ người dùng gõ, so với `name` (collation không phân biệt dấu, trừ đ/d) */
  name?: string;
  /** Từ đã slugify, so với `slug` (đã bỏ dấu, đổi đ thành d): "do" khớp "Đồ ăn" */
  slug?: string;
}

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gợi ý tag: chứa `name` hoặc `slug`; không có bộ lọc thì lấy mọi tag. Tag gắn nhiều bài trước.
   * Đếm mọi bài gắn tag (kể cả chưa đăng): bảng tag nhỏ, không cần chính xác tuyệt đối.
   */
  suggest(filter: TagSuggestFilter, take: number): Promise<TagRow[]> {
    const or: Prisma.TagWhereInput[] = [];
    if (filter.name) or.push({ name: { contains: filter.name } });
    if (filter.slug) or.push({ slug: { contains: filter.slug } });

    return this.prisma.tag.findMany({
      where: or.length > 0 ? { OR: or } : undefined,
      select: tagSelect,
      orderBy: [{ posts: { _count: "desc" } }, { name: "asc" }],
      take,
    });
  }

  findBySlug(slug: string): Promise<TagRow | null> {
    return this.prisma.tag.findUnique({ where: { slug }, select: tagSelect });
  }
}
