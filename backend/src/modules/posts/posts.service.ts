import { Injectable } from "@nestjs/common";
import {
  COMPOSER_MESSAGES,
  CONTENT_FORMATS,
  type CreatePostInput,
  FILE_MESSAGES,
  type ListPostsQuery,
  POST_STATUSES,
  type PostDetail,
  type PostListItem,
  pathIdSchema,
  pathSlugSchema,
  withSlugSuffix,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import { baseSlug, excerptFromContent } from "./posts.compose.js";
import { toPostDetail, toPostListItem } from "./posts.mapper.js";
import { PostsPolicy } from "./posts.policy.js";
import { PostsRepository } from "./posts.repository.js";
import { buildPostSearchText } from "./posts.search-text.js";

const POST_NOT_FOUND = "Không tìm thấy bài viết này. Có thể bài đã được gỡ hoặc đường dẫn bị sai.";
const CATEGORY_GONE = "Danh mục này không còn. Bạn chọn danh mục khác nhé.";

/** 10 bài mỗi 10 phút mỗi người: thoải mái cho người thật, chặn spam. */
const CREATE_RATE = {
  limit: 10,
  windowMs: 10 * 60 * 1000,
  message: COMPOSER_MESSAGES.RATE_LIMITED,
};

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly rateLimiter: RateLimiter,
  ) {}

  /**
   * Đăng bài soạn kiểu mạng xã hội (docs/tinh-nang.md mục 2.3). Mọi thành viên đăng thẳng (ADR 0008), người bị
   * cấm đã bị AuthGuard chặn. Tiêu đề tùy chọn; tóm tắt, slug tự tính; ảnh, video gắn theo thứ tự `mediaIds`.
   */
  async create(user: SessionUser, input: CreatePostInput): Promise<PostDetail> {
    this.rateLimiter.consume(`post:${user.id}`, CREATE_RATE);

    const excerpt = excerptFromContent(input.content);
    const result = await this.postsRepository.createWithMedia(
      {
        title: input.title,
        slug: await this.uniqueSlug(baseSlug(input.title, input.content)),
        excerpt,
        content: input.content,
        contentFormat: CONTENT_FORMATS.PLAIN,
        searchText: buildPostSearchText({ title: input.title, excerpt, tagNames: [] }),
        status: POST_STATUSES.PUBLISHED,
        publishedAt: new Date(),
        authorId: user.id,
        categorySlug: input.category,
      },
      input.mediaIds,
    );

    if (!result.ok) {
      const categoryGone = result.reason === "CATEGORY_NOT_FOUND";
      const message = categoryGone ? CATEGORY_GONE : FILE_MESSAGES.NOT_ATTACHABLE;
      throw new AppException("VALIDATION_ERROR", message, {
        [categoryGone ? "category" : "mediaIds"]: message,
      });
    }
    return this.getBySlug(user, result.slug);
  }

  /** `base` nếu chưa ai dùng, không thì `base-2`, `base-3`... (số nhỏ nhất còn trống). */
  private async uniqueSlug(base: string): Promise<string> {
    const taken = new Set(await this.postsRepository.findSlugsStartingWith(base));
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(withSlugSuffix(base, n))) n++;
    return withSlugSuffix(base, n);
  }

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
