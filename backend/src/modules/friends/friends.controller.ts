import { Controller, Delete, Get, Param, Put, Query } from "@nestjs/common";
import {
  type FriendItem,
  type FriendRequestItem,
  type FriendsPageQuery,
  friendsPageQuerySchema,
  type FriendshipState,
  type ListFriendRequestsQuery,
  listFriendRequestsQuerySchema,
} from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { FriendsService } from "./friends.service.js";

/** Bạn bè của người đang đăng nhập (docs/api.md mục "Bạn bè, chặn"). `:userId` là id người kia. */
@Controller("friends")
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  list(
    @CurrentUser() user: SessionUser,
    @Query(new ZodValidationPipe(friendsPageQuerySchema)) query: FriendsPageQuery,
  ): Promise<Paginated<FriendItem>> {
    return this.friendsService.listFriends(user, query);
  }

  @Get("requests")
  requests(
    @CurrentUser() user: SessionUser,
    @Query(new ZodValidationPipe(listFriendRequestsQuerySchema)) query: ListFriendRequestsQuery,
  ): Promise<Paginated<FriendRequestItem>> {
    return this.friendsService.listRequests(user, query);
  }

  /** Gửi lời mời, hoặc chấp nhận nếu người kia đã mời mình. Trả trạng thái sau thao tác. */
  @Put(":userId")
  add(@CurrentUser() user: SessionUser, @Param("userId") userId: string): Promise<FriendshipState> {
    return this.friendsService.add(user, userId);
  }

  /** Hủy lời mời, từ chối, hủy kết bạn. Trả 200 kèm trạng thái để trang hồ sơ cập nhật nút. */
  @Delete(":userId")
  remove(
    @CurrentUser() user: SessionUser,
    @Param("userId") userId: string,
  ): Promise<FriendshipState> {
    return this.friendsService.remove(user, userId);
  }
}
