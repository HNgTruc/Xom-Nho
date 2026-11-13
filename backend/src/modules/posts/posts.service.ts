import { Injectable, Logger } from "@nestjs/common";
import {
  ADMIN_MESSAGES,
  ADMIN_STATS_RANGE_DAYS,
  type AdminPostStats,
  type AdminPostStatsQuery,
  type AdminStatsRange,
  type AdminListPostsQuery,
  type AdminPostListItem,
  type ArchivePostInput,
  COMPOSER_MESSAGES,
  CONTENT_FORMATS,
  DISLIKE_MESSAGES,
  EMPTY_POST_MESSAGE,
  type CreatePostInput,
  FILE_MESSAGES,
  LIKE_MESSAGES,
  LIMITS,
  type ListPostsQuery,
  POST_MESSAGES,
  POST_STATUSES,
  POST_STATUS_VALUES,
  type PostDetail,
  type PostLikeState,
  type PostListItem,
  type PostStatus,
  pathIdSchema,
  pathSlugSchema,
  toSearchText,
  type UpdatePostInput,
  withSlugSuffix,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import { StorageService } from "../../infrastructure/storage/storage.service.js";
import { baseSlug, excerptFromContent } from "./posts.compose.js";
import { toAdminPostListItem, toPostDetail, toPostListItem } from "./posts.mapper.js";
import { type PostAccessTarget, PostsPolicy } from "./posts.policy.js";
import {
  type CommentPreviewRow,
  type CreatePostFailure,
  type PostEditRow,
  type PostListRow,
  PostsRepository,
} from "./posts.repository.js";
import { buildPostSearchText } from "./posts.search-text.js";

const POST_NOT_FOUND = "Không tìm thấy bài viết này. Có thể bài đã được gỡ hoặc đường dẫn bị sai.";
const CATEGORY_GONE = "Danh mục này không còn. Bạn chọn danh mục khác nhé.";

/** 10 bài mỗi 10 phút mỗi người: thoải mái cho người thật, chặn spam. */
const CREATE_RATE = {
  limit: 10,
  windowMs: 10 * 60 * 1000,
  message: COMPOSER_MESSAGES.RATE_LIMITED,
};

/**
 * 60 lần thích / bỏ thích mỗi phút mỗi người. Ghi lặp không làm sai số (khóa chính), giới hạn này chỉ để chặn
 * script bấm liên tục (sau này mỗi lượt thích còn tạo thông báo).
 */
const LIKE_RATE = {
  limit: 60,
  windowMs: 60 * 1000,
  message: LIKE_MESSAGES.RATE_LIMITED,
};

/** Lưu bài (đăng hoặc sửa) không được: báo đúng ô có vấn đề. */
function saveFailure(reason: CreatePostFailure): AppException {
  const categoryGone = reason === "CATEGORY_NOT_FOUND";
  const message = categoryGone ? CATEGORY_GONE : FILE_MESSAGES.NOT_ATTACHABLE;
  return new AppException("VALIDATION_ERROR", message, {
    [categoryGone ? "category" : "mediaIds"]: message,
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Đầu khoảng thống kê tính tới `now` (7, 30 ngày); `all` thì `null`. */
function rangeStart(range: AdminStatsRange, now: Date): Date | null {
  const days = ADMIN_STATS_RANGE_DAYS[range];
  return days === null ? null : new Date(now.getTime() - days * DAY_MS);
}

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly rateLimiter: RateLimiter,
    private readonly storage: StorageService,
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

    if (!result.ok) throw saveFailure(result.reason);
    return this.getBySlug(user, result.slug);
  }

  /**
   * Sửa bài của mình (docs/tinh-nang.md mục 2.3). Slug giữ nguyên để liên kết đã chia sẻ không hỏng; tóm tắt,
   * searchText tính lại khi đổi chữ. Ảnh, video bỏ ra bị xóa khỏi ổ đĩa sau khi lưu xong. Trạng thái không đổi
   * (bài đang bị ẩn vẫn ẩn tới khi trưởng xóm khôi phục).
   */
  async update(user: SessionUser, id: string, input: UpdatePostInput): Promise<PostDetail> {
    const post = await this.findModifiable(user, id);

    const title = input.title ?? post.title;
    const content = input.content ?? post.content;
    const mediaCount = input.mediaIds?.length ?? post.media.length;
    if (content === "" && mediaCount === 0) {
      throw new AppException("VALIDATION_ERROR", EMPTY_POST_MESSAGE, {
        content: EMPTY_POST_MESSAGE,
      });
    }

    const textChanged = input.title !== undefined || input.content !== undefined;
    const excerpt = excerptFromContent(content);
    const result = await this.postsRepository.updateWithMedia(
      id,
      user.id,
      {
        title: input.title,
        content: input.content,
        ...(textChanged && {
          excerpt,
          searchText: buildPostSearchText({
            title,
            excerpt,
            tagNames: post.tags.map(({ tag }) => tag.name),
          }),
        }),
        categorySlug: input.category,
      },
      input.mediaIds,
    );
    if (!result.ok) throw saveFailure(result.reason);

    await this.removeFiles(result.removedStorageKeys);
    return this.getBySlug(user, post.slug);
  }

  /** Xóa hẳn bài của mình: bình luận, tag, ảnh, video đi theo; file xóa khỏi ổ đĩa sau khi xóa dòng. */
  async remove(user: SessionUser, id: string): Promise<void> {
    await this.findModifiable(user, id);
    const storageKeys = await this.postsRepository.deleteWithMedia(id);
    await this.removeFiles(storageKeys);
  }

  /**
   * Bài mà `user` được sửa, xóa. Không có, id sai dạng, hoặc không được xem: NOT_FOUND (không lộ là có).
   * Xem được mà không phải bài của mình: FORBIDDEN.
   */
  private async findModifiable(user: SessionUser, id: string): Promise<PostEditRow> {
    if (!pathIdSchema.safeParse(id).success) throw new AppException("NOT_FOUND", POST_NOT_FOUND);

    const post = await this.postsRepository.findForEdit(id);
    if (!post || !PostsPolicy.canView(user, post)) {
      throw new AppException("NOT_FOUND", POST_NOT_FOUND);
    }
    if (!PostsPolicy.canModify(user, post)) {
      throw new AppException("FORBIDDEN", POST_MESSAGES.NOT_OWNER);
    }
    return post;
  }

  /**
   * Xóa file trên đĩa sau khi database đã xong. Lỗi thì chỉ ghi log: dòng đã mất, file còn lại là rác vô hại,
   * không làm hỏng việc sửa, xóa bài của người dùng.
   */
  private async removeFiles(storageKeys: readonly string[]): Promise<void> {
    await Promise.all(
      storageKeys.map((key) =>
        this.storage.remove(key).catch((error: unknown) => {
          this.logger.warn(`Không xóa được file ${key}: ${String(error)}`);
        }),
      ),
    );
  }

  /** `base` nếu chưa ai dùng, không thì `base-2`, `base-3`... (số nhỏ nhất còn trống). */
  private async uniqueSlug(base: string): Promise<string> {
    const taken = new Set(await this.postsRepository.findSlugsStartingWith(base));
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(withSlugSuffix(base, n))) n++;
    return withSlugSuffix(base, n);
  }

  /** Danh sách công khai: chỉ bài đã đăng, mọi thành viên xem được. */
  async list(user: SessionUser, query: ListPostsQuery): Promise<Paginated<PostListItem>> {
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
    return paginate(await this.toListItems(user, rows), total, page, pageSize);
  }

  /**
   * Bài đã đăng theo danh sách id, giữ đúng thứ tự `ids` (id không còn đăng thì bỏ qua).
   * Cho module khác đã tự chọn bài (tìm kiếm) dùng chung cách dựng `PostListItem`.
   */
  async listPublishedByIds(user: SessionUser, ids: string[]): Promise<PostListItem[]> {
    if (ids.length === 0) return [];
    const rows = await this.postsRepository.findByIds(ids, POST_STATUSES.PUBLISHED);
    const byId = new Map(rows.map((row) => [row.id, row]));
    const ordered = ids.flatMap((id) => {
      const row = byId.get(id);
      return row ? [row] : [];
    });
    return this.toListItems(user, ordered);
  }

  /**
   * Dựng thẻ bài cho một trang: thêm `likedByMe`, `dislikedByMe` và bình luận xem trước. Ba truy vấn cho cả trang
   * (không phải mỗi bài một truy vấn), giữ nguyên thứ tự `rows`.
   */
  private async toListItems(
    user: SessionUser,
    rows: readonly PostListRow[],
  ): Promise<PostListItem[]> {
    const ids = rows.map((row) => row.id);
    const [liked, disliked, comments] = await Promise.all([
      this.postsRepository.findLikedPostIds(user.id, ids),
      this.postsRepository.findDislikedPostIds(user.id, ids),
      this.postsRepository.findLatestComments(ids, LIMITS.FEED_LATEST_COMMENTS),
    ]);
    const commentsByPost = new Map<string, CommentPreviewRow[]>();
    for (const comment of comments) {
      const list = commentsByPost.get(comment.postId) ?? [];
      list.push(comment);
      commentsByPost.set(comment.postId, list);
    }
    return rows.map((row) =>
      toPostListItem(row, {
        likedByMe: liked.has(row.id),
        dislikedByMe: disliked.has(row.id),
        latestComments: commentsByPost.get(row.id) ?? [],
      }),
    );
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
    const [liked, disliked] = user
      ? await Promise.all([
          this.postsRepository.findLikedPostIds(user.id, [row.id]),
          this.postsRepository.findDislikedPostIds(user.id, [row.id]),
        ])
      : [new Set<string>(), new Set<string>()];
    return toPostDetail(row, { likedByMe: liked.has(row.id), dislikedByMe: disliked.has(row.id) });
  }

  /**
   * Thích bài (docs/tinh-nang.md mục 2.6). Gọi lặp lại vẫn chỉ tính một lần. Không xem được bài: NOT_FOUND.
   * Xem được mà bài chưa đăng hoặc đã bị ẩn (chủ bài, trưởng xóm): FORBIDDEN.
   */
  async like(user: SessionUser, id: string): Promise<PostLikeState> {
    const post = await this.findViewable(user, id);
    if (!PostsPolicy.canLike(user, post)) {
      throw new AppException("FORBIDDEN", LIKE_MESSAGES.POST_CLOSED);
    }
    this.rateLimiter.consume(`like:${user.id}`, LIKE_RATE);
    await this.postsRepository.addLike(id, user.id);
    return this.likeState(id, user.id);
  }

  /** Bỏ thích. Chưa thích cũng không lỗi. Chỉ cần xem được bài, kể cả bài đã bị ẩn. */
  async unlike(user: SessionUser, id: string): Promise<PostLikeState> {
    await this.findViewable(user, id);
    this.rateLimiter.consume(`like:${user.id}`, LIKE_RATE);
    await this.postsRepository.removeLike(id, user.id);
    return this.likeState(id, user.id);
  }

  /**
   * Không thích bài (ADR 0009): cùng quy tắc với Thích, và tự gỡ lượt Thích của người đó. Gọi lặp lại vẫn chỉ
   * tính một lần. Không xem được bài: NOT_FOUND; bài chưa đăng hoặc đã bị ẩn: FORBIDDEN.
   */
  async dislike(user: SessionUser, id: string): Promise<PostLikeState> {
    const post = await this.findViewable(user, id);
    if (!PostsPolicy.canDislike(user, post)) {
      throw new AppException("FORBIDDEN", DISLIKE_MESSAGES.POST_CLOSED);
    }
    // Dùng chung bộ đếm với Thích: bấm qua lại giữa hai nút cũng tính vào cùng giới hạn
    this.rateLimiter.consume(`like:${user.id}`, LIKE_RATE);
    await this.postsRepository.addDislike(id, user.id);
    return this.likeState(id, user.id);
  }

  /** Bỏ Không thích. Chưa bấm cũng không lỗi. Chỉ cần xem được bài, kể cả bài đã bị ẩn. */
  async undislike(user: SessionUser, id: string): Promise<PostLikeState> {
    await this.findViewable(user, id);
    this.rateLimiter.consume(`like:${user.id}`, LIKE_RATE);
    await this.postsRepository.removeDislike(id, user.id);
    return this.likeState(id, user.id);
  }

  private async likeState(postId: string, userId: string): Promise<PostLikeState> {
    const state = await this.postsRepository.findLikeState(postId, userId);
    return {
      liked: state.liked,
      likeCount: state.count,
      disliked: state.disliked,
      dislikeCount: state.dislikeCount,
    };
  }

  /** Bài mà `user` xem được. Không có, id sai dạng, hoặc không được xem: NOT_FOUND (không lộ là có). */
  private async findViewable(user: SessionUser, id: string): Promise<PostAccessTarget> {
    if (!pathIdSchema.safeParse(id).success) throw new AppException("NOT_FOUND", POST_NOT_FOUND);

    const target = await this.postsRepository.findAccessTarget(id);
    if (!target || !PostsPolicy.canView(user, target)) {
      throw new AppException("NOT_FOUND", POST_NOT_FOUND);
    }
    return target;
  }

  /**
   * Trạng thái của bài mà `user` xem được, cho module khác (bình luận) kiểm tra trước khi đọc, ghi.
   * Không có, id sai dạng, hoặc không được xem: NOT_FOUND như `getBySlug`.
   */
  async getVisibleStatus(user: SessionUser, id: string): Promise<PostStatus> {
    return (await this.findViewable(user, id)).status;
  }

  // ===== Quản trị (`posts.admin.controller.ts`, chỉ trưởng xóm: `@Roles("admin")`) =====

  /**
   * Bảng bài cho trưởng xóm: mọi trạng thái. Màn Bài mới gửi `since` (bài tạo sau mốc) + `sort=oldest`
   * (pages/admin.md mục "Bài mới"). Từ khóa có dấu hay không đều được (so với `searchText` đã bỏ dấu).
   */
  async adminList(query: AdminListPostsQuery): Promise<Paginated<AdminPostListItem>> {
    const { page, pageSize, status, category, author, q, since, range, sort, order } = query;
    const [rows, total] = await this.postsRepository.findAdminList(
      {
        status,
        categorySlug: category,
        authorUsername: author,
        searchText: q ? toSearchText(q) : undefined,
        createdAfter: since ? new Date(since) : undefined,
        createdFrom: range ? (rangeStart(range, new Date()) ?? undefined) : undefined,
      },
      { sort, order, skip: (page - 1) * pageSize, take: pageSize },
    );
    return paginate(rows.map(toAdminPostListItem), total, page, pageSize);
  }

  /**
   * Thẻ số liệu ở màn Bài viết: số bài tạo trong khoảng (mọi trạng thái), so với khoảng liền trước cùng độ dài,
   * và số bài theo trạng thái (mọi lúc) cho các tab. `all` không có khoảng trước để so.
   */
  async adminStats(query: AdminPostStatsQuery): Promise<AdminPostStats> {
    const now = new Date();
    const from = rangeStart(query.range, now);
    const previousFrom = from ? new Date(2 * from.getTime() - now.getTime()) : null;
    const [total, previousTotal, statusRows] = await Promise.all([
      this.postsRepository.countCreated({ from: from ?? undefined }),
      previousFrom
        ? this.postsRepository.countCreated({ from: previousFrom, before: from ?? undefined })
        : Promise.resolve(null),
      this.postsRepository.countByStatus(),
    ]);
    const byStatus = Object.fromEntries(POST_STATUS_VALUES.map((s) => [s, 0])) as Record<
      PostStatus,
      number
    >;
    for (const row of statusRows) byStatus[row.status] = row.count;
    return {
      range: query.range,
      from: from?.toISOString() ?? null,
      to: now.toISOString(),
      total,
      previousTotal,
      byStatus,
    };
  }

  /**
   * Trưởng xóm ẩn bài đang hiện, lý do bắt buộc (pages/admin.md mục "Ẩn bài"). Lý do lưu ở `rejectReason`,
   * tác giả thấy trên trang bài; người khác không còn thấy bài. Bài không đang hiện: CONFLICT.
   */
  async archive(
    admin: SessionUser,
    id: string,
    input: ArchivePostInput,
  ): Promise<AdminPostListItem> {
    const post = await this.findForModeration(id);
    if (!PostsPolicy.canArchive(post)) {
      throw new AppException("CONFLICT", ADMIN_MESSAGES.POST_NOT_PUBLISHED);
    }
    const row = await this.postsRepository.setModeration(id, {
      status: POST_STATUSES.ARCHIVED,
      rejectReason: input.reason,
      reviewerId: admin.id,
    });
    return toAdminPostListItem(row);
  }

  /** Hiện lại bài đang ẩn, xóa lý do. Bài không đang ẩn: CONFLICT. */
  async restore(admin: SessionUser, id: string): Promise<AdminPostListItem> {
    const post = await this.findForModeration(id);
    if (!PostsPolicy.canRestore(post)) {
      throw new AppException("CONFLICT", ADMIN_MESSAGES.POST_NOT_HIDDEN);
    }
    const row = await this.postsRepository.setModeration(id, {
      status: POST_STATUSES.PUBLISHED,
      rejectReason: null,
      reviewerId: admin.id,
    });
    return toAdminPostListItem(row);
  }

  /** Trưởng xóm xóa hẳn bài bất kỳ: như `remove` nhưng không cần là tác giả. */
  async adminRemove(id: string): Promise<void> {
    await this.findForModeration(id);
    const storageKeys = await this.postsRepository.deleteWithMedia(id);
    await this.removeFiles(storageKeys);
  }

  /** Bài bất kỳ theo id cho route admin. Không có hoặc id sai dạng: NOT_FOUND. */
  private async findForModeration(id: string): Promise<PostAccessTarget> {
    if (!pathIdSchema.safeParse(id).success) {
      throw new AppException("NOT_FOUND", ADMIN_MESSAGES.POST_NOT_FOUND);
    }
    const post = await this.postsRepository.findAccessTarget(id);
    if (!post) throw new AppException("NOT_FOUND", ADMIN_MESSAGES.POST_NOT_FOUND);
    return post;
  }

  /** Tăng lượt xem. Chỉ tính cho bài đã đăng; bài khác coi như không có. */
  async recordView(id: string): Promise<void> {
    if (!pathIdSchema.safeParse(id).success) throw new AppException("NOT_FOUND", POST_NOT_FOUND);

    const updated = await this.postsRepository.incrementViewCount(id, POST_STATUSES.PUBLISHED);
    if (updated === 0) throw new AppException("NOT_FOUND", POST_NOT_FOUND);
  }
}
