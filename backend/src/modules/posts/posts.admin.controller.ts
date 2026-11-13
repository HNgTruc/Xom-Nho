import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  type AdminListPostsQuery,
  adminListPostsQuerySchema,
  type AdminPostListItem,
  type ArchivePostInput,
  archivePostSchema,
  ROLES,
} from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { PostsService } from "./posts.service.js";

/** Bài viết trong trang quản trị (docs/api.md mục "Quản trị", pages/admin.md mục "Bài mới", "Ẩn bài"). */
@Controller("admin/posts")
@Roles(ROLES.ADMIN)
export class PostsAdminController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminListPostsQuerySchema)) query: AdminListPostsQuery,
  ): Promise<Paginated<AdminPostListItem>> {
    return this.postsService.adminList(query);
  }

  /** Ẩn bài đang hiện, lý do bắt buộc. Trả 200 kèm dòng bài sau khi ẩn. */
  @Post(":id/archive")
  @HttpCode(HttpStatus.OK)
  archive(
    @CurrentUser() admin: SessionUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(archivePostSchema)) input: ArchivePostInput,
  ): Promise<AdminPostListItem> {
    return this.postsService.archive(admin, id, input);
  }

  /** Hiện lại bài đang ẩn. Trả 200 kèm dòng bài sau khi hiện. */
  @Post(":id/restore")
  @HttpCode(HttpStatus.OK)
  restore(@CurrentUser() admin: SessionUser, @Param("id") id: string): Promise<AdminPostListItem> {
    return this.postsService.restore(admin, id);
  }

  /** Xóa hẳn bài bất kỳ, cả bình luận, ảnh, video. Trả 204. */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string): Promise<void> {
    return this.postsService.adminRemove(id);
  }
}
