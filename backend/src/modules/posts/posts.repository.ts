import { Injectable } from "@nestjs/common";
import type { PostSort, PostStatus } from "@xom-nho/shared";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

/** Cột cho danh sách bài: không lấy `content` để danh sách nhẹ. */
export const postListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  viewCount: true,
  author: { select: { id: true, name: true, username: true, image: true } },
  category: { select: { name: true, slug: true } },
  tags: {
    select: { tag: { select: { name: true, slug: true } } },
    orderBy: { tag: { name: "asc" } },
  },
  _count: { select: { comments: { where: { status: "VISIBLE" } } } },
} satisfies Prisma.PostSelect;

export const postDetailSelect = {
  ...postListSelect,
  content: true,
  status: true,
  rejectReason: true,
  updatedAt: true,
} satisfies Prisma.PostSelect;

export type PostListRow = Prisma.PostGetPayload<{ select: typeof postListSelect }>;
export type PostDetailRow = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

export interface PostListFilter {
  status: PostStatus;
  categorySlug?: string;
  tagSlug?: string;
  authorUsername?: string;
}

export interface PostListPage {
  sort: PostSort;
  skip: number;
  take: number;
}

// Thêm `id` cuối để thứ tự ổn định khi trùng ngày/lượt xem (không lặp, không sót bài giữa các trang)
const ORDER_BY: Record<PostSort, Prisma.PostOrderByWithRelationInput[]> = {
  new: [{ publishedAt: "desc" }, { id: "desc" }],
  top: [{ viewCount: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
};

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Một trang bài theo bộ lọc, kèm tổng số bài khớp bộ lọc. */
  async findList(filter: PostListFilter, page: PostListPage): Promise<[PostListRow[], number]> {
    // Lọc theo slug/username bằng quan hệ: MySQL dùng index unique của bảng kia, không cần truy vấn riêng
    const where: Prisma.PostWhereInput = {
      status: filter.status,
      category: filter.categorySlug ? { slug: filter.categorySlug } : undefined,
      tags: filter.tagSlug ? { some: { tag: { slug: filter.tagSlug } } } : undefined,
      author: filter.authorUsername ? { username: filter.authorUsername } : undefined,
    };

    return Promise.all([
      this.prisma.post.findMany({
        where,
        select: postListSelect,
        orderBy: ORDER_BY[page.sort],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.post.count({ where }),
    ]);
  }

  /** Bài theo id, chỉ lấy bài ở trạng thái `status`. Không giữ thứ tự: service tự sắp lại. */
  findByIds(ids: string[], status: PostStatus): Promise<PostListRow[]> {
    return this.prisma.post.findMany({
      where: { id: { in: ids }, status },
      select: postListSelect,
    });
  }

  findBySlug(slug: string): Promise<PostDetailRow | null> {
    return this.prisma.post.findUnique({ where: { slug }, select: postDetailSelect });
  }

  /**
   * Tăng lượt xem nếu bài đang ở trạng thái `status`. Trả số bài được cập nhật (0 hoặc 1).
   * Dùng SQL thô: `update` của Prisma tự đổi `updatedAt` (@updatedAt), mà lượt xem không phải là sửa bài.
   */
  incrementViewCount(id: string, status: PostStatus): Promise<number> {
    return this.prisma.$executeRaw`
      UPDATE post SET viewCount = viewCount + 1 WHERE id = ${id} AND status = ${status}`;
  }
}
