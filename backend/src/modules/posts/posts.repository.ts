import { Injectable } from "@nestjs/common";
import type { ContentFormat, PostSort, PostStatus } from "@xom-nho/api";
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
  author: { select: { id: true, name: true, username: true, image: true, avatarId: true } },
  category: { select: { name: true, slug: true, color: true } },
  tags: {
    select: { tag: { select: { name: true, slug: true } } },
    orderBy: { tag: { name: "asc" } },
  },
  _count: { select: { comments: { where: { status: "VISIBLE" } } } },
  media: { select: { id: true, kind: true, mimeType: true }, orderBy: { position: "asc" } },
} satisfies Prisma.PostSelect;

export const postDetailSelect = {
  ...postListSelect,
  content: true,
  contentFormat: true,
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

/** Dữ liệu bài mới, service đã tính sẵn (slug, tóm tắt, searchText, trạng thái). */
export interface NewPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: ContentFormat;
  searchText: string;
  status: PostStatus;
  publishedAt: Date | null;
  authorId: string;
  categorySlug: string;
}

export type CreatePostFailure = "CATEGORY_NOT_FOUND" | "MEDIA_NOT_ATTACHABLE";

export type CreatePostResult =
  { ok: true; slug: string } | { ok: false; reason: CreatePostFailure };

/** Dừng transaction tạo, sửa bài (rollback) mà không phải lỗi hệ thống. */
class CreatePostAbort extends Error {
  constructor(readonly reason: CreatePostFailure) {
    super(reason);
  }
}

/** Phần bài cần để sửa, xóa: quyền, giá trị đang có (để tính tóm tắt, searchText), file đang gắn. */
const postEditSelect = {
  id: true,
  slug: true,
  title: true,
  content: true,
  status: true,
  authorId: true,
  tags: { select: { tag: { select: { name: true } } } },
  media: { select: { id: true }, orderBy: { position: "asc" } },
} satisfies Prisma.PostSelect;

export type PostEditRow = Prisma.PostGetPayload<{ select: typeof postEditSelect }>;

/** Thay đổi service đã tính sẵn; trường `undefined` thì giữ nguyên. */
export interface PostChanges {
  title?: string;
  content?: string;
  excerpt?: string;
  searchText?: string;
  categorySlug?: string;
}

/** Sửa xong: khóa file đã gỡ khỏi bài (service xóa trên đĩa sau khi transaction xong). */
export type UpdatePostResult =
  { ok: true; removedStorageKeys: string[] } | { ok: false; reason: CreatePostFailure };

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

  /** Các slug đã dùng bắt đầu bằng `base` (để chọn hậu tố -2, -3... khi trùng). */
  async findSlugsStartingWith(base: string): Promise<string[]> {
    const rows = await this.prisma.post.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return rows.map((row) => row.slug);
  }

  /**
   * Tạo bài và gắn ảnh, video trong một transaction. File phải của chính tác giả và chưa gắn bài nào
   * (`updateMany` có điều kiện, nên hai bài gửi cùng lúc không giành được cùng một file). Không đạt thì rollback.
   * Bảng `media` thuộc module files, nhưng gắn file vào bài là một phần của việc tạo bài nên làm ở đây
   * để nằm trong cùng transaction.
   */
  async createWithMedia(data: NewPostData, mediaIds: readonly string[]): Promise<CreatePostResult> {
    const { categorySlug, ...post } = data;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const category = await tx.category.findUnique({
          where: { slug: categorySlug },
          select: { id: true },
        });
        if (!category) throw new CreatePostAbort("CATEGORY_NOT_FOUND");

        const created = await tx.post.create({
          data: { ...post, categoryId: category.id },
          select: { id: true, slug: true },
        });
        for (const [position, id] of mediaIds.entries()) {
          // `purpose: POST`: ảnh đại diện cũng chưa gắn bài, nhưng không được thành ảnh của bài
          const { count } = await tx.media.updateMany({
            where: { id, ownerId: data.authorId, postId: null, purpose: "POST" },
            data: { postId: created.id, position },
          });
          if (count !== 1) throw new CreatePostAbort("MEDIA_NOT_ATTACHABLE");
        }
        return { ok: true as const, slug: created.slug };
      });
    } catch (error) {
      if (error instanceof CreatePostAbort) return { ok: false, reason: error.reason };
      throw error;
    }
  }

  findForEdit(id: string): Promise<PostEditRow | null> {
    return this.prisma.post.findUnique({ where: { id }, select: postEditSelect });
  }

  /**
   * Sửa bài trong một transaction. `mediaIds` (nếu có) là danh sách đầy đủ sau khi sửa: file bỏ ra bị xóa dòng,
   * file giữ lại và file mới được xếp lại thứ tự. File mới phải của tác giả, chưa gắn bài nào, không phải ảnh
   * đại diện (`updateMany` có điều kiện, như lúc đăng). Không đạt thì rollback, không đổi gì.
   */
  async updateWithMedia(
    id: string,
    authorId: string,
    changes: PostChanges,
    mediaIds: readonly string[] | undefined,
  ): Promise<UpdatePostResult> {
    const { categorySlug, ...fields } = changes;
    try {
      return await this.prisma.$transaction(async (tx) => {
        let categoryId: string | undefined;
        if (categorySlug !== undefined) {
          const category = await tx.category.findUnique({
            where: { slug: categorySlug },
            select: { id: true },
          });
          if (!category) throw new CreatePostAbort("CATEGORY_NOT_FOUND");
          categoryId = category.id;
        }

        let removedStorageKeys: string[] = [];
        if (mediaIds !== undefined) {
          const keep = new Set(mediaIds);
          const current = await tx.media.findMany({
            where: { postId: id },
            select: { id: true, storageKey: true },
          });
          const removed = current.filter((media) => !keep.has(media.id));
          await tx.media.deleteMany({ where: { id: { in: removed.map((media) => media.id) } } });
          removedStorageKeys = removed.map((media) => media.storageKey);

          for (const [position, mediaId] of mediaIds.entries()) {
            const { count } = await tx.media.updateMany({
              where: {
                id: mediaId,
                ownerId: authorId,
                purpose: "POST",
                OR: [{ postId: id }, { postId: null }],
              },
              data: { postId: id, position },
            });
            if (count !== 1) throw new CreatePostAbort("MEDIA_NOT_ATTACHABLE");
          }
        }

        await tx.post.update({ where: { id }, data: { ...fields, categoryId } });
        return { ok: true as const, removedStorageKeys };
      });
    } catch (error) {
      if (error instanceof CreatePostAbort) return { ok: false, reason: error.reason };
      throw error;
    }
  }

  /**
   * Xóa bài; bình luận, tag, dòng media xóa theo (`onDelete: Cascade`). Trả khóa file để service xóa trên đĩa
   * sau khi transaction xong.
   */
  async deleteWithMedia(id: string): Promise<string[]> {
    return this.prisma.$transaction(async (tx) => {
      const media = await tx.media.findMany({
        where: { postId: id },
        select: { storageKey: true },
      });
      await tx.post.deleteMany({ where: { id } });
      return media.map((item) => item.storageKey);
    });
  }

  /** Phần policy cần để quyết định ai xem được bài (module khác gọi qua PostsService). */
  findAccessTarget(id: string): Promise<{ status: PostStatus; authorId: string } | null> {
    return this.prisma.post.findUnique({ where: { id }, select: { status: true, authorId: true } });
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
