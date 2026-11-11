import { Injectable } from "@nestjs/common";
import type { PostStatus } from "@xom-nho/api";
import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

export interface SearchFilter {
  /** Biểu thức boolean đã làm sạch (`toBooleanQuery`), không phải chữ người dùng gõ */
  booleanQuery: string;
  status: PostStatus;
  categorySlug?: string;
}

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Id bài khớp từ khóa, liên quan nhất trước, rồi mới nhất. Kèm tổng số bài khớp.
   * Truy vấn thô vì Prisma không hỗ trợ FULLTEXT với MySQL; mọi giá trị đi qua tham số của tagged template.
   */
  async findIds(
    filter: SearchFilter,
    page: { skip: number; take: number },
  ): Promise<[string[], number]> {
    const match = Prisma.sql`MATCH(searchText) AGAINST(${filter.booleanQuery} IN BOOLEAN MODE)`;
    const byCategory = filter.categorySlug
      ? Prisma.sql`AND categoryId = (SELECT id FROM category WHERE slug = ${filter.categorySlug})`
      : Prisma.empty;
    const where = Prisma.sql`WHERE status = ${filter.status} AND ${match} ${byCategory}`;

    const [rows, counts] = await Promise.all([
      this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM post ${where}
        ORDER BY ${match} DESC, publishedAt DESC, id DESC
        LIMIT ${page.take} OFFSET ${page.skip}`,
      this.prisma.$queryRaw<{ total: bigint }[]>`SELECT COUNT(*) AS total FROM post ${where}`,
    ]);
    return [rows.map((row) => row.id), Number(counts[0]?.total ?? 0)];
  }
}
