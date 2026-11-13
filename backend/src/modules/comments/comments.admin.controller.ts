import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import {
  type AdminCommentListItem,
  type AdminListCommentsQuery,
  adminListCommentsQuerySchema,
  COMMENT_STATUSES,
  ROLES,
} from "@xom-nho/api";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import { CommentsService } from "./comments.service.js";

/** Bình luận trong trang quản trị (docs/api.md mục "Quản trị", docs/tinh-nang.md mục 4.3). */
@Controller("admin/comments")
@Roles(ROLES.ADMIN)
export class CommentsAdminController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminListCommentsQuerySchema)) query: AdminListCommentsQuery,
  ): Promise<Paginated<AdminCommentListItem>> {
    return this.commentsService.adminList(query);
  }

  @Post(":id/hide")
  @HttpCode(HttpStatus.OK)
  hide(@Param("id") id: string): Promise<AdminCommentListItem> {
    return this.commentsService.setStatus(id, COMMENT_STATUSES.HIDDEN);
  }

  @Post(":id/show")
  @HttpCode(HttpStatus.OK)
  show(@Param("id") id: string): Promise<AdminCommentListItem> {
    return this.commentsService.setStatus(id, COMMENT_STATUSES.VISIBLE);
  }

  /** Xóa hẳn bình luận bất kỳ, trả lời bên dưới bị xóa theo. Trả 204. */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string): Promise<void> {
    return this.commentsService.adminRemove(id);
  }
}
