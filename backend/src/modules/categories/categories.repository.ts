import { Injectable } from "@nestjs/common";
import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

export const categoryListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  color: true,
  icon: true,
  _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
} as const;

export type CategoryListRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  _count: { posts: number };
};

/** Danh mục cho màn quản trị: thêm tổng số bài mọi trạng thái (khóa ngoại chặn xóa khi còn bài bất kỳ). */
export type AdminCategoryRow = CategoryListRow & { totalPosts: number };

/** Dữ liệu ghi vào bảng `category` (đã kiểm tra, đã sinh slug ở service). */
export interface CategoryWriteData {
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
}

/** Ghi không được vì tên (hoặc slug) đã có: cột `name`, `slug` là UNIQUE. */
export class CategoryNameTakenError extends Error {}

const ORDER_BY = [
  { sortOrder: "asc" },
  { name: "asc" },
] satisfies Prisma.CategoryOrderByWithRelationInput[];

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<CategoryListRow[]> {
    return this.prisma.category.findMany({ select: categoryListSelect, orderBy: ORDER_BY });
  }

  /**
   * Mọi danh mục theo thứ tự menu, kèm số bài đã đăng và tổng số bài. Tổng đếm riêng bằng `groupBy` vì `_count`
   * không chọn được cùng một quan hệ hai lần (một lần có điều kiện, một lần đếm hết).
   */
  async findAllForAdmin(): Promise<AdminCategoryRow[]> {
    const [rows, totals] = await Promise.all([
      this.findAll(),
      this.prisma.post.groupBy({ by: ["categoryId"], _count: { _all: true } }),
    ]);
    const byCategory = new Map(totals.map((row) => [row.categoryId, row._count._all]));
    return rows.map((row) => ({ ...row, totalPosts: byCategory.get(row.id) ?? 0 }));
  }

  async findForAdmin(id: string): Promise<AdminCategoryRow | null> {
    const [row, totalPosts] = await Promise.all([
      this.prisma.category.findUnique({ where: { id }, select: categoryListSelect }),
      this.prisma.post.count({ where: { categoryId: id } }),
    ]);
    return row ? { ...row, totalPosts } : null;
  }

  /** Mọi id danh mục (để so với danh sách gửi lên khi sắp xếp). */
  async findAllIds(): Promise<string[]> {
    const rows = await this.prisma.category.findMany({ select: { id: true } });
    return rows.map((row) => row.id);
  }

  /** Các slug đã dùng bắt đầu bằng `base` (để chọn hậu tố -2, -3... khi trùng). */
  async findSlugsStartingWith(base: string): Promise<string[]> {
    const rows = await this.prisma.category.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return rows.map((row) => row.slug);
  }

  /** Thêm vào cuối menu (`sortOrder` lớn nhất + 1). Tên, slug trùng: `CategoryNameTakenError`. */
  async create(data: CategoryWriteData & { slug: string }): Promise<string> {
    const last = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
    try {
      const row = await this.prisma.category.create({
        data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
        select: { id: true },
      });
      return row.id;
    } catch (error) {
      if (isUniqueViolation(error)) throw new CategoryNameTakenError();
      throw error;
    }
  }

  /** Sửa tên, mô tả, màu, biểu tượng; không đụng slug. Tên trùng: `CategoryNameTakenError`. */
  async update(id: string, data: CategoryWriteData): Promise<void> {
    try {
      await this.prisma.category.update({ where: { id }, data, select: { id: true } });
    } catch (error) {
      if (isUniqueViolation(error)) throw new CategoryNameTakenError();
      throw error;
    }
  }

  /** Đặt `sortOrder` theo vị trí trong `ids` (0, 1, 2...), một transaction. */
  async reorder(ids: readonly string[]): Promise<void> {
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.category.update({
          where: { id },
          data: { sortOrder: index },
          select: { id: true },
        }),
      ),
    );
  }

  /**
   * Xóa nếu không còn bài nào, trong một transaction để bài mới đăng chen vào giữa lúc đếm và lúc xóa không lọt
   * qua (khóa ngoại `Restrict` cũng chặn). Trả số bài còn lại: khác 0 là chưa xóa.
   */
  async deleteIfEmpty(id: string): Promise<number> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const posts = await tx.post.count({ where: { categoryId: id } });
        if (posts === 0) await tx.category.delete({ where: { id }, select: { id: true } });
        return posts;
      });
    } catch (error) {
      // P2003: khóa ngoại chặn vì có bài vừa được thêm
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        return this.prisma.post.count({ where: { categoryId: id } });
      }
      throw error;
    }
  }
}
