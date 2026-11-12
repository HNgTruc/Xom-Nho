import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from "@nestjs/common";
import {
  type CommentItem,
  type CommentThread,
  type CreateCommentInput,
  createCommentSchema,
  type UpdateCommentInput,
  updateCommentSchema,
} from "@xom-nho/api";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { CommentsService } from "./comments.service.js";

/** Bình luận dưới bài (docs/api.md mục "Bình luận"). Mọi route cần đăng nhập (ADR 0007). */
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /** Kết quả tùy người xem (trưởng xóm thấy cả bình luận đã ẩn): không cho cache dùng chung giữ lại. */
  @Get("posts/:postId/comments")
  list(
    @CurrentUser() user: SessionUser,
    @Param("postId") postId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommentThread[]> {
    res.setHeader("Cache-Control", "private, no-store");
    return this.commentsService.list(user, postId);
  }

  /** Bình luận hoặc trả lời (`parentId`). Trả 201 kèm bình luận vừa gửi. */
  @Post("posts/:postId/comments")
  create(
    @CurrentUser() user: SessionUser,
    @Param("postId") postId: string,
    @Body(new ZodValidationPipe(createCommentSchema)) input: CreateCommentInput,
  ): Promise<CommentItem> {
    return this.commentsService.create(user, postId, input);
  }

  @Patch("comments/:id")
  update(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCommentSchema)) input: UpdateCommentInput,
  ): Promise<CommentItem> {
    return this.commentsService.update(user, id, input);
  }

  @Delete("comments/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: SessionUser, @Param("id") id: string): Promise<void> {
    return this.commentsService.remove(user, id);
  }
}
