import { Injectable } from "@nestjs/common";
import {
  type ListPostsQuery,
  POST_STATUSES,
  type PostDetail,
  type PostListItem,
  pathIdSchema,
  pathSlugSchema,
} from "@xom-nho/shared";
import { AppException } from "../../common/exceptions/app-exception.js";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { toPostDetail, toPostListItem } from "./posts.mapper.js";
import { PostsPolicy } from "./posts.policy.js";
import { PostsRepository } from "./posts.repository.js";

const POST_NOT_FOUND = "Không tìm thấy bài viết này. Có thể bài đã được gỡ hoặc đường dẫn bị sai.";

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  /** Danh sách công khai: chỉ bài đã đăng, ai cũng xem được. */
  async list(query: ListPostsQuery): Promise<Paginated<PostListItem>> {
    const { page, pageSize, sort, category, tag, author } = query;
    const [rows, total] = await this.postsRepository.findList(
      {
        status: POST_STATUSES.PUBLISHED,
        categorySlug: category,
        tagSlug: tag,
        authorUsername: author,
      },
      { sort, skip: (page - 1) * pageSize, take: pageSize },
    );
    return paginate(rows.map(toPostListItem), total, page, pageSize);
  }

  /**
   * Bài đã đăng theo danh sách id, giữ đúng thứ tự `ids` (id không còn đăng thì bỏ qua).
   * Cho module khác đã tự chọn bài (tìm kiếm) dùng chung cách dựng `PostListItem`.
   */
  async listPublishedByIds(ids: string[]): Promise<PostListItem[]> {
    if (ids.length === 0) return [];
    const rows = await this.postsRepository.findByIds(ids, POST_STATUSES.PUBLISHED);
    const byId = new Map(rows.map((row) => [row.id, row]));
    return ids.flatMap((id) => {
      const row = byId.get(id);
      return row ? [toPostListItem(row)] : [];
    });
  }

  /**
   * Chi tiết bài. Không có, hoặc không được xem (bài chưa đăng của người khác), đều trả NOT_FOUND
   * để không lộ là bài có tồn tại. Slug sai định dạng, kể cả viết hoa, cũng coi là không có (404, không phải
   * 400): mỗi bài chỉ có một URL.
   */
  async getBySlug(user: SessionUser | undefined, slug: string): Promise<PostDetail> {
    if (!pathSlugSchema.safeParse(slug).success)
      throw new AppException("NOT_FOUND", POST_NOT_FOUND);

    const row = await this.postsRepository.findBySlug(slug);
    if (!row || !PostsPolicy.canView(user, { status: row.status, authorId: row.author.id })) {
      throw new AppException("NOT_FOUND", POST_NOT_FOUND);
    }
    return toPostDetail(row);
  }

  /** Tăng lượt xem. Chỉ tính cho bài đã đăng; bài khác coi như không có. */
  async recordView(id: string): Promise<void> {
    if (!pathIdSchema.safeParse(id).success) throw new AppException("NOT_FOUND", POST_NOT_FOUND);

    const updated = await this.postsRepository.incrementViewCount(id, POST_STATUSES.PUBLISHED);
    if (updated === 0) throw new AppException("NOT_FOUND", POST_NOT_FOUND);
  }
}
