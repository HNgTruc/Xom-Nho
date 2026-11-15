import { Controller, Get, Query } from "@nestjs/common";
import { type ListMyPostsQuery, listMyPostsQuerySchema, type MyPostListItem } from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { PostsService } from "./posts.service.js";

/** Bài của người đang đăng nhập (`GET /me/posts`), mọi trạng thái. */
@Controller("me/posts")
export class PostsMeController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  list(
    @CurrentUser() user: SessionUser,
    @Query(new ZodValidationPipe(listMyPostsQuerySchema)) query: ListMyPostsQuery,
  ): Promise<Paginated<MyPostListItem>> {
    return this.postsService.listMine(user, query);
  }
}
