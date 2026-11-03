import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

export const categoryListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  color: true,
  _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
} as const;

export type CategoryListRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  _count: { posts: number };
};

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<CategoryListRow[]> {
    return this.prisma.category.findMany({
      select: categoryListSelect,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }
}
