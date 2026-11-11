import { Injectable } from "@nestjs/common";
import { LIMITS, pathSlugSchema, slugify, type Tag, type TagSuggestQuery } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { toTag } from "./tags.mapper.js";
import { TagsRepository } from "./tags.repository.js";

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
}
