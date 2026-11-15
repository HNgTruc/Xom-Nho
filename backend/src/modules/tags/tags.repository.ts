import { Injectable } from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";
import { buildPostSearchText } from "../posts/posts.search-text.js";

export const tagSelect = { id: true, name: true, slug: true } satisfies Prisma.TagSelect;

export type TagRow = Prisma.TagGetPayload<{ select: typeof tagSelect }>;

/** Thẻ cho màn quản trị: thêm ngày tạo và số bài gắn thẻ (mọi trạng thái). */
const adminTagSelect = {
  ...tagSelect,
  createdAt: true,
  _count: { select: { posts: true } },
} satisfies Prisma.TagSelect;

export type AdminTagRow = Prisma.TagGetPayload<{ select: typeof adminTagSelect }>;

/** Bộ lọc của `GET /admin/tags`: `name` so với tên, `slug` (đã slugify) so với slug, khớp một trong hai. */
export interface AdminTagListFilter {
  name?: string;
  slug?: string;
}

/** Gộp, xóa thẻ đụng tới nhiều bài: cho transaction dài hơn mặc định 5 giây. */
const TAG_WRITE_TIMEOUT_MS = 30_000;

type Tx = Prisma.TransactionClient;

/**
 * Tính lại `post.searchText` (tiêu đề + tóm tắt + tên tag) cho các bài trong `postIds`, sau khi danh sách tag
 * của chúng đổi (docs/co-so-du-lieu.md, "Khi nào phải tính lại searchText"). Chạy trong transaction của thao tác.
 */
async function refreshSearchText(tx: Tx, postIds: readonly string[]): Promise<void> {
  if (postIds.length === 0) return;
  const posts = await tx.post.findMany({
    where: { id: { in: [...postIds] } },
    select: {
      id: true,
      title: true,
      excerpt: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });
  for (const post of posts) {
    const searchText = buildPostSearchText({
      title: post.title,
      excerpt: post.excerpt,
      tagNames: post.tags.map((link) => link.tag.name),
    });
    await tx.post.update({ where: { id: post.id }, data: { searchText }, select: { id: true } });
  }
}

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

  /** Một trang thẻ cho bảng quản trị. `posts`: gắn nhiều bài trước; `name`: A đến Z. */
  async findAdminList(
    filter: AdminTagListFilter,
    sort: "posts" | "name",
    page: { skip: number; take: number },
  ): Promise<[AdminTagRow[], number]> {
    const or: Prisma.TagWhereInput[] = [];
    if (filter.name) or.push({ name: { contains: filter.name } });
    if (filter.slug) or.push({ slug: { contains: filter.slug } });
    const where: Prisma.TagWhereInput = or.length > 0 ? { OR: or } : {};
    const orderBy: Prisma.TagOrderByWithRelationInput[] =
      sort === "name"
        ? [{ name: "asc" }, { id: "asc" }]
        : [{ posts: { _count: "desc" } }, { name: "asc" }, { id: "asc" }];
    return Promise.all([
      this.prisma.tag.findMany({
        where,
        select: adminTagSelect,
        orderBy,
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.tag.count({ where }),
    ]);
  }

  findAdminRow(id: string): Promise<AdminTagRow | null> {
    return this.prisma.tag.findUnique({ where: { id }, select: adminTagSelect });
  }

  /**
   * Gộp thẻ `sourceId` vào `targetId` trong một transaction: gắn `targetId` cho mọi bài đang có `sourceId` (bài đã
   * có cả hai thì bỏ qua, khóa chính `postId, tagId`), xóa `sourceId` (liên kết còn lại xóa theo), tính lại
   * `searchText` của các bài đó.
   */
  async merge(sourceId: string, targetId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const postIds = await this.postIdsOf(tx, sourceId);
        if (postIds.length > 0) {
          await tx.postTag.createMany({
            data: postIds.map((postId) => ({ postId, tagId: targetId })),
            skipDuplicates: true,
          });
        }
        await tx.tag.delete({ where: { id: sourceId }, select: { id: true } });
        await refreshSearchText(tx, postIds);
      },
      { timeout: TAG_WRITE_TIMEOUT_MS },
    );
  }

  /** Xóa thẻ (gỡ khỏi mọi bài, bài vẫn còn) và tính lại `searchText` của các bài đó, một transaction. */
  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const postIds = await this.postIdsOf(tx, id);
        await tx.tag.delete({ where: { id }, select: { id: true } });
        await refreshSearchText(tx, postIds);
      },
      { timeout: TAG_WRITE_TIMEOUT_MS },
    );
  }

  private async postIdsOf(tx: Tx, tagId: string): Promise<string[]> {
    const links = await tx.postTag.findMany({ where: { tagId }, select: { postId: true } });
    return links.map((link) => link.postId);
  }
}
