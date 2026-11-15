import { Injectable } from "@nestjs/common";
import {
  ADMIN_MESSAGES,
  type AdminListTagsQuery,
  type AdminTag,
  LIMITS,
  type MergeTagInput,
  pathIdSchema,
  pathSlugSchema,
  slugify,
  type Tag,
  type TagSuggestQuery,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import { toAdminTag, toTag } from "./tags.mapper.js";
import { type AdminTagRow, TagsRepository } from "./tags.repository.js";

const TAG_NOT_FOUND = "Không tìm thấy tag này. Có thể tag đã được gộp hoặc đường dẫn bị sai.";

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  /** Gợi ý tag khi gõ ở trình soạn bài. `q` rỗng: tag dùng nhiều nhất. Ai cũng xem được. */
  async suggest(query: TagSuggestQuery): Promise<Tag[]> {
    const q = query.q;
    const rows = await this.tagsRepository.suggest(
      // slugify bỏ dấu và đổi đ thành d, bù cho collation coi "đ" khác "d"
      { name: q || undefined, slug: slugify(q) || undefined },
      LIMITS.TAG_SUGGEST_MAX,
    );
    return rows.map(toTag);
  }

  /** Một tag theo slug, để làm tiêu đề trang `/tag/<slug>` kể cả khi tag chưa có bài đã đăng. */
  async getBySlug(slug: string): Promise<Tag> {
    if (!pathSlugSchema.safeParse(slug).success) throw new AppException("NOT_FOUND", TAG_NOT_FOUND);

    const row = await this.tagsRepository.findBySlug(slug);
    if (!row) throw new AppException("NOT_FOUND", TAG_NOT_FOUND);
    return toTag(row);
  }

  /** Bảng thẻ của trưởng xóm: tìm theo tên (có dấu hay không đều được, như gợi ý tag), phân trang. */
  async adminList(query: AdminListTagsQuery): Promise<Paginated<AdminTag>> {
    const { q, sort, page, pageSize } = query;
    const [rows, total] = await this.tagsRepository.findAdminList(
      { name: q || undefined, slug: (q && slugify(q)) || undefined },
      sort,
      { skip: (page - 1) * pageSize, take: pageSize },
    );
    return paginate(rows.map(toAdminTag), total, page, pageSize);
  }

  /**
   * Gộp thẻ trùng nghĩa (docs/tinh-nang.md mục 4.4): mọi bài của thẻ `id` chuyển sang thẻ đích, thẻ `id` bị xóa,
   * tìm kiếm của các bài đó tính lại. Gộp vào chính nó: VALIDATION_ERROR. Thẻ nào không có: NOT_FOUND.
   */
  async merge(id: string, input: MergeTagInput): Promise<AdminTag> {
    if (id === input.targetId) {
      throw new AppException("VALIDATION_ERROR", ADMIN_MESSAGES.TAG_MERGE_SELF, {
        targetId: ADMIN_MESSAGES.TAG_MERGE_SELF,
      });
    }
    await this.findForAdmin(id);
    await this.findForAdmin(input.targetId);
    await this.tagsRepository.merge(id, input.targetId);
    return toAdminTag(await this.findForAdmin(input.targetId));
  }

  /** Xóa thẻ: gỡ khỏi mọi bài (bài vẫn còn), tìm kiếm của các bài đó tính lại. Không có: NOT_FOUND. */
  async adminRemove(id: string): Promise<void> {
    await this.findForAdmin(id);
    await this.tagsRepository.delete(id);
  }

  private async findForAdmin(id: string): Promise<AdminTagRow> {
    const row = pathIdSchema.safeParse(id).success
      ? await this.tagsRepository.findAdminRow(id)
      : null;
    if (!row) throw new AppException("NOT_FOUND", ADMIN_MESSAGES.TAG_NOT_FOUND);
    return row;
  }
}
