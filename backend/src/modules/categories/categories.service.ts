import { Injectable } from "@nestjs/common";
import {
  ADMIN_MESSAGES,
  type AdminCategory,
  type Category,
  type CategoryData,
  LIMITS,
  pathIdSchema,
  type ReorderCategoriesInput,
  slugify,
  withSlugSuffix,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { toAdminCategory, toCategory } from "./categories.mapper.js";
import {
  CategoriesRepository,
  CategoryNameTakenError,
  type CategoryWriteData,
} from "./categories.repository.js";

/** Tên chỉ có ký tự đặc biệt (slugify ra rỗng) thì dùng đường dẫn này, trùng thì thêm số. */
const FALLBACK_CATEGORY_SLUG = "danh-muc";

function toWriteData(input: CategoryData): CategoryWriteData {
  return {
    name: input.name,
    description: input.description,
    color: input.color,
    icon: input.icon,
  };
}

function nameTaken(): AppException {
  return new AppException("CONFLICT", ADMIN_MESSAGES.CATEGORY_NAME_TAKEN, {
    name: ADMIN_MESSAGES.CATEGORY_NAME_TAKEN,
  });
}

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /** Mọi danh mục theo thứ tự trưởng xóm sắp, kèm số bài đã đăng. Ai cũng xem được. */
  async list(): Promise<Category[]> {
    const rows = await this.categoriesRepository.findAll();
    return rows.map(toCategory);
  }

  /** Màn Danh mục: thêm tổng số bài mọi trạng thái để biết xóa được hay chưa. */
  async adminList(): Promise<AdminCategory[]> {
    const rows = await this.categoriesRepository.findAllForAdmin();
    return rows.map(toAdminCategory);
  }

  /** Thêm danh mục vào cuối menu Chủ đề. Đường dẫn sinh từ tên, trùng thì thêm `-2`, `-3`. Tên trùng: CONFLICT. */
  async create(input: CategoryData): Promise<AdminCategory> {
    const slug = await this.uniqueSlug(
      slugify(input.name).slice(0, LIMITS.CATEGORY_SLUG_MAX).replace(/-+$/, "") ||
        FALLBACK_CATEGORY_SLUG,
    );
    try {
      const id = await this.categoriesRepository.create({ ...toWriteData(input), slug });
      return await this.adminGet(id);
    } catch (error) {
      if (error instanceof CategoryNameTakenError) throw nameTaken();
      throw error;
    }
  }

  /**
   * Sửa tên, mô tả, màu, biểu tượng. Đường dẫn giữ nguyên dù đổi tên: link đã chia sẻ tới trang danh mục và bộ
   * lọc `?category=` không gãy. Tên trùng danh mục khác: CONFLICT.
   */
  async update(id: string, input: CategoryData): Promise<AdminCategory> {
    await this.adminGet(id);
    try {
      await this.categoriesRepository.update(id, toWriteData(input));
    } catch (error) {
      if (error instanceof CategoryNameTakenError) throw nameTaken();
      throw error;
    }
    return this.adminGet(id);
  }

  /**
   * Sắp lại menu Chủ đề. Phải gửi đủ mọi danh mục, không thừa không thiếu: danh sách lệch (người khác vừa thêm hay
   * xóa danh mục) thì CONFLICT để trang tải lại, thay vì lưu một thứ tự thiếu.
   */
  async reorder(input: ReorderCategoriesInput): Promise<AdminCategory[]> {
    const current = new Set(await this.categoriesRepository.findAllIds());
    const sameSet = current.size === input.ids.length && input.ids.every((id) => current.has(id));
    if (!sameSet) throw new AppException("CONFLICT", ADMIN_MESSAGES.CATEGORY_ORDER_INVALID);
    await this.categoriesRepository.reorder(input.ids);
    return this.adminList();
  }

  /** Xóa danh mục không còn bài nào (mọi trạng thái). Còn bài: CONFLICT, giao diện ghi rõ còn bao nhiêu bài. */
  async remove(id: string): Promise<void> {
    await this.adminGet(id);
    const remaining = await this.categoriesRepository.deleteIfEmpty(id);
    if (remaining > 0) throw new AppException("CONFLICT", ADMIN_MESSAGES.CATEGORY_HAS_POSTS);
  }

  private async adminGet(id: string): Promise<AdminCategory> {
    const row = pathIdSchema.safeParse(id).success
      ? await this.categoriesRepository.findForAdmin(id)
      : null;
    if (!row) throw new AppException("NOT_FOUND", ADMIN_MESSAGES.CATEGORY_NOT_FOUND);
    return toAdminCategory(row);
  }

  /** `base` nếu chưa danh mục nào dùng, không thì `base-2`, `base-3`... (số nhỏ nhất còn trống). */
  private async uniqueSlug(base: string): Promise<string> {
    const taken = new Set(await this.categoriesRepository.findSlugsStartingWith(base));
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(withSlugSuffix(base, n, LIMITS.CATEGORY_SLUG_MAX))) n++;
    return withSlugSuffix(base, n, LIMITS.CATEGORY_SLUG_MAX);
  }
}
