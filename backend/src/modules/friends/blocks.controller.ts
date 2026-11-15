import { Controller, Delete, Get, Param, Put, Query } from "@nestjs/common";
import {
  type BlockedItem,
  type FriendsPageQuery,
  friendsPageQuerySchema,
  type FriendshipState,
} from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { FriendsService } from "./friends.service.js";

/** Chặn hàng xóm (docs/api.md mục "Bạn bè, chặn"). Cùng service với bạn bè vì chặn xóa luôn quan hệ bạn bè. */
@Controller("blocks")
export class BlocksController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  list(
    @CurrentUser() user: SessionUser,
    @Query(new ZodValidationPipe(friendsPageQuerySchema)) query: FriendsPageQuery,
  ): Promise<Paginated<BlockedItem>> {
    return this.friendsService.listBlocked(user, query);
  }

  @Put(":userId")
  block(
    @CurrentUser() user: SessionUser,
    @Param("userId") userId: string,
  ): Promise<FriendshipState> {
    return this.friendsService.block(user, userId);
  }

  @Delete(":userId")
  unblock(
    @CurrentUser() user: SessionUser,
    @Param("userId") userId: string,
  ): Promise<FriendshipState> {
    return this.friendsService.unblock(user, userId);
  }
}
