import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Res } from "@nestjs/common";
import {
  type ListPostsQuery,
  listPostsQuerySchema,
  POST_STATUSES,
  type PostDetail,
  type PostListItem,
} from "@xom-nho/api";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { PostsService } from "./posts.service.js";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  list(
    @Query(new ZodValidationPipe(listPostsQuerySchema)) query: ListPostsQuery,
  ): Promise<Paginated<PostListItem>> {
    return this.postsService.list(query);
  }

  /** Công khai, nhưng vẫn đọc phiên nếu có để tác giả và trưởng xóm xem được bài chưa đăng. */
  @Public()
  @Get(":slug")
  async get(
    @CurrentUser() user: SessionUser | undefined,
    @Param("slug") slug: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostDetail> {
    // Cùng URL nhưng kết quả tùy phiên (bản nháp hay 404): cache dùng chung phải tách theo cookie.
    // Đặt trước khi gọi service để cả phản hồi 404 cũng có.
    res.setHeader("Vary", "Cookie");
    const post = await this.postsService.getBySlug(user, slug);
    // Bài chưa đăng chỉ chủ bài, trưởng xóm thấy: không cho CDN hay trình duyệt lưu lại
    if (post.status !== POST_STATUSES.PUBLISHED)
      res.setHeader("Cache-Control", "private, no-store");
    return post;
  }

  @Public()
  @Post(":id/view")
  @HttpCode(HttpStatus.NO_CONTENT)
  view(@Param("id") id: string): Promise<void> {
    return this.postsService.recordView(id);
  }
}
