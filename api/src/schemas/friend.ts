import { z } from "zod";
import {
  FRIEND_REQUEST_DIRECTIONS,
  FRIEND_REQUEST_DIRECTION_VALUES,
} from "../constants/friendship.js";
import { LIMITS } from "../constants/limits.js";
import { paginationQuerySchema } from "./pagination.js";

/** `?page=&pageSize=` của `GET /friends`, `GET /blocks`: mặc định 20 người một trang. */
export const friendsPageQuerySchema = paginationQuerySchema.extend({
  pageSize: z.coerce
    .number()
    .int()
    .min(1, "Mỗi trang cần ít nhất 1 mục")
    .max(LIMITS.PAGE_SIZE_MAX, `Mỗi trang tối đa ${LIMITS.PAGE_SIZE_MAX} mục`)
    .default(LIMITS.FRIENDS_PAGE_SIZE),
});

export type FriendsPageQuery = z.infer<typeof friendsPageQuerySchema>;

/** `GET /friends/requests?direction=`: mặc định lời mời nhận được. */
export const listFriendRequestsQuerySchema = friendsPageQuerySchema.extend({
  direction: z
    .enum(FRIEND_REQUEST_DIRECTION_VALUES, { error: "Loại lời mời không hợp lệ" })
    .default(FRIEND_REQUEST_DIRECTIONS.INCOMING),
});

export type ListFriendRequestsQuery = z.infer<typeof listFriendRequestsQuerySchema>;
