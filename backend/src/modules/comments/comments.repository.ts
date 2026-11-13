import { Injectable } from "@nestjs/common";
import type { CommentStatus } from "@xom-nho/api";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

/** Cột trả ra API; tác giả chỉ phần `UserSummary` (không có email, thông tin cấm). */
const commentSelect = {
  id: true,
  postId: true,
  parentId: true,
  content: true,
  status: true,
  authorId: true,
  createdAt: true,
  editedAt: true,
  author: { select: { id: true, name: true, username: true, image: true, avatarId: true } },
} satisfies Prisma.CommentSelect;

export type CommentRow = Prisma.CommentGetPayload<{ select: typeof commentSelect }>;

/** Cột cho bảng quản trị: thêm bài chứa bình luận (tiêu đề, slug để mở trang bài). */
const adminCommentSelect = {
  ...commentSelect,
  post: { select: { id: true, title: true, slug: true, excerpt: true } },
} satisfies Prisma.CommentSelect;

export type AdminCommentRow = Prisma.CommentGetPayload<{ select: typeof adminCommentSelect }>;

/** Bộ lọc của `GET /admin/comments`; trường `undefined` thì bỏ qua. */
export interface AdminCommentListFilter {
  status?: CommentStatus;
  postId?: string;
  authorUsername?: string;
  contentContains?: string;
}

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Mọi bình luận của bài ở các trạng thái `statuses`, cũ trước mới sau (chỉ mục `postId, status, createdAt`). */
  findByPost(postId: string, statuses: readonly CommentStatus[]): Promise<CommentRow[]> {
    return this.prisma.comment.findMany({
      where: { postId, status: { in: [...statuses] } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: commentSelect,
    });
  }

  findById(id: string): Promise<CommentRow | null> {
    return this.prisma.comment.findUnique({ where: { id }, select: commentSelect });
  }

  create(data: {
    postId: string;
    authorId: string;
    parentId: string | null;
    content: string;
  }): Promise<CommentRow> {
    return this.prisma.comment.create({ data, select: commentSelect });
  }

  updateContent(id: string, content: string, editedAt: Date): Promise<CommentRow> {
    return this.prisma.comment.update({
      where: { id },
      data: { content, editedAt },
      select: commentSelect,
    });
  }

  /**
   * Một trang bình luận cho bảng quản trị, mới nhất trước. Từ khóa tìm trong nội dung bằng LIKE (collation
   * mặc định của MySQL 8 không phân biệt hoa thường, dấu).
   */
  async findAdminList(
    filter: AdminCommentListFilter,
    page: { skip: number; take: number },
  ): Promise<[AdminCommentRow[], number]> {
    const where: Prisma.CommentWhereInput = {
      status: filter.status,
      postId: filter.postId,
      author: filter.authorUsername ? { username: filter.authorUsername } : undefined,
      content: filter.contentContains ? { contains: filter.contentContains } : undefined,
    };
    return Promise.all([
      this.prisma.comment.findMany({
        where,
        select: adminCommentSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.comment.count({ where }),
    ]);
  }

  /** Ẩn hoặc hiện bình luận (không đụng `editedAt`: đây không phải người viết sửa). */
  setStatus(id: string, status: CommentStatus): Promise<AdminCommentRow> {
    return this.prisma.comment.update({
      where: { id },
      data: { status },
      select: adminCommentSelect,
    });
  }

  /** Xóa bình luận; trả lời bên dưới bị xóa theo (`onDelete: Cascade` trên `parentId`). */
  async delete(id: string): Promise<void> {
    await this.prisma.comment.deleteMany({ where: { id } });
  }
}
