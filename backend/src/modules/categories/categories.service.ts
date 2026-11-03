import { Injectable } from "@nestjs/common";
import type { Category } from "@xom-nho/shared";
import { toCategory } from "./categories.mapper.js";
import { CategoriesRepository } from "./categories.repository.js";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /** Mọi danh mục theo thứ tự trưởng xóm sắp, kèm số bài đã đăng. Ai cũng xem được. */
  async list(): Promise<Category[]> {
    const rows = await this.categoriesRepository.findAll();
    return rows.map(toCategory);
  }
}
