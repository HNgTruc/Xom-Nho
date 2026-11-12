import { Injectable } from "@nestjs/common";
import {
  COMMENT_MESSAGES,
  COMMENT_STATUSES,
  type CommentItem,
  type CommentThread,
  type CreateCommentInput,
  POST_STATUSES,
  pathIdSchema,
  type UpdateCommentInput,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import { PostsService } from "../posts/posts.service.js";
import { toCommentItem, toCommentThreads } from "./comments.mapper.js";
import { CommentsPolicy } from "./comments.policy.js";
import { type CommentRow, CommentsRepository } from "./comments.repository.js";

/** 1 bình luận mỗi 10 giây mỗi người (docs/api.md, mục Giới hạn tần suất): chặn gửi dồn dập. */
const CREATE_RATE = {
  limit: 1,
  windowMs: 10 * 1000,
  message: COMMENT_MESSAGES.RATE_LIMITED,
};

/**
 * Bình luận dưới bài (docs/tinh-nang.md mục 3): trả lời một cấp, sửa, xóa của mình. Bài chứa bình luận phải xem
 * được (PostsService); bình luận đã ẩn chỉ trưởng xóm thấy. Ẩn, hiện, xóa của người khác là route admin.
 */
@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsService: PostsService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  /** Các nhánh bình luận của bài. Bài không có, hoặc người xem không được xem: NOT_FOUND. */
  async list(user: SessionUser, postId: string): Promise<CommentThread[]> {
    await this.postsService.getVisibleStatus(user, postId);
    const statuses = CommentsPolicy.seesHidden(user)
      ? [COMMENT_STATUSES.VISIBLE, COMMENT_STATUSES.HIDDEN]
      : [COMMENT_STATUSES.VISIBLE];
    return toCommentThreads(await this.commentsRepository.findByPost(postId, statuses));
  }

  /**
   * Bình luận hoặc trả lời. Chỉ bài đã đăng nhận bình luận. Trả lời một trả lời thì gắn vào bình luận gốc của
   * nhánh (frontend tự điền "@tên" vào nội dung), nên luôn chỉ một cấp.
   */
  async create(user: SessionUser, postId: string, input: CreateCommentInput): Promise<CommentItem> {
    const postStatus = await this.postsService.getVisibleStatus(user, postId);
    if (postStatus !== POST_STATUSES.PUBLISHED) {
      throw new AppException("FORBIDDEN", COMMENT_MESSAGES.POST_CLOSED);
    }
    const parentId = input.parentId ? await this.resolveRootId(user, postId, input.parentId) : null;

    this.rateLimiter.consume(`comment:${user.id}`, CREATE_RATE);
    const row = await this.commentsRepository.create({
      postId,
      authorId: user.id,
      parentId,
      content: input.content,
    });
    return toCommentItem(row);
  }

  /** Sửa nội dung bình luận của mình. Nội dung không đổi thì giữ nguyên, không đánh dấu "đã sửa". */
  async update(user: SessionUser, id: string, input: UpdateCommentInput): Promise<CommentItem> {
    const comment = await this.findModifiable(user, id);
    if (comment.content === input.content) return toCommentItem(comment);

    const row = await this.commentsRepository.updateContent(id, input.content, new Date());
    return toCommentItem(row);
  }

  /** Xóa hẳn bình luận của mình; trả lời bên dưới bị xóa theo. */
  async remove(user: SessionUser, id: string): Promise<void> {
    await this.findModifiable(user, id);
    await this.commentsRepository.delete(id);
  }

  /**
   * Id bình luận gốc của nhánh mà `parentId` thuộc về. Bình luận được trả lời (và gốc của nó) phải cùng bài và
   * người trả lời xem được; không thì báo lỗi ở ô `parentId`.
   */
  private async resolveRootId(
    user: SessionUser,
    postId: string,
    parentId: string,
  ): Promise<string> {
    const parent = await this.commentsRepository.findById(parentId);
    const root =
      parent?.parentId != null ? await this.commentsRepository.findById(parent.parentId) : parent;
    const usable = [parent, root].every(
      (comment) => comment && comment.postId === postId && CommentsPolicy.canView(user, comment),
    );
    if (!usable || !root) {
      throw new AppException("VALIDATION_ERROR", COMMENT_MESSAGES.PARENT_GONE, {
        parentId: COMMENT_MESSAGES.PARENT_GONE,
      });
    }
    return root.id;
  }

  /**
   * Bình luận mà `user` được sửa, xóa. Không có, đã ẩn với người xem, hoặc nằm trong bài người xem không mở
   * được: NOT_FOUND (không lộ là có). Thấy được mà không phải của mình: FORBIDDEN.
   */
  private async findModifiable(user: SessionUser, id: string): Promise<CommentRow> {
    if (!pathIdSchema.safeParse(id).success) {
      throw new AppException("NOT_FOUND", COMMENT_MESSAGES.NOT_FOUND);
    }
    const comment = await this.commentsRepository.findById(id);
    if (!comment || !CommentsPolicy.canView(user, comment)) {
      throw new AppException("NOT_FOUND", COMMENT_MESSAGES.NOT_FOUND);
    }
    await this.postsService.getVisibleStatus(user, comment.postId);
    if (!CommentsPolicy.canModify(user, comment)) {
      throw new AppException("FORBIDDEN", COMMENT_MESSAGES.NOT_OWNER);
    }
    return comment;
  }
}
