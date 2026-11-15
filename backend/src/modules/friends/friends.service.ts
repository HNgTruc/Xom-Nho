import { Injectable } from "@nestjs/common";
import {
  type BlockedItem,
  FRIEND_MESSAGES,
  FRIEND_REQUEST_DIRECTIONS,
  type FriendItem,
  type FriendRequestItem,
  type FriendsPageQuery,
  type FriendshipState,
  type ListFriendRequestsQuery,
  pathIdSchema,
  RELATIONSHIP_STATUSES,
  type Relationship,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { isBanned } from "../../infrastructure/auth/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import { orderFriendPair } from "./friendship-pair.js";
import { otherPerson, toUserSummary } from "./friends.mapper.js";
import { FriendsPolicy, type RelationshipFacts } from "./friends.policy.js";
import { type FriendTargetRow, FriendsRepository } from "./friends.repository.js";

/** 20 lời mời MỚI mỗi 10 phút mỗi người: chấp nhận, gỡ, chặn, gọi lặp không tính (docs/api.md). */
const REQUEST_RATE = {
  limit: 20,
  windowMs: 10 * 60 * 1000,
  message: FRIEND_MESSAGES.RATE_LIMITED,
};

/** Người kia, như service cần: id, cấm (để tính `canRequest`). Hồ sơ (`UsersService`) truyền thẳng dòng đã có. */
export type FriendTarget = FriendTargetRow;

/**
 * Kết bạn, chặn (docs/tinh-nang.md mục 1.5, docs/api.md mục "Bạn bè, chặn"). Mỗi cặp một dòng `friendship`,
 * khóa dựng bằng `orderFriendPair`. Module khác (hồ sơ) dùng `relationshipFor`, `friendCount`.
 */
@Injectable()
export class FriendsService {
  constructor(
    private readonly friendsRepository: FriendsRepository,
    private readonly rateLimiter: RateLimiter,
  ) {}

  /** Quan hệ của người đang xem với một hàng xóm, cho `PublicProfile.relationship`. */
  async relationshipFor(viewer: SessionUser, target: FriendTarget): Promise<Relationship> {
    return toRelationship(await this.facts(viewer.id, target));
  }

  /** Số bạn đã chấp nhận (lời mời đang chờ không tính). */
  friendCount(userId: string): Promise<number> {
    return this.friendsRepository.countFriends(userId);
  }

  /**
   * Kết bạn: chưa có quan hệ thì gửi lời mời; người kia đã mời mình thì chấp nhận. Đã mời hay đã là bạn thì
   * giữ nguyên. Bị chặn (chiều nào cũng vậy) hay người kia bị cấm: FORBIDDEN, một câu chung không lộ lý do.
   */
  async add(user: SessionUser, userId: string): Promise<FriendshipState> {
    const target = await this.findTarget(user, userId, FRIEND_MESSAGES.SELF);
    const facts = await this.facts(user.id, target);
    const status = FriendsPolicy.status(facts);
    if (status === RELATIONSHIP_STATUSES.FRIENDS || status === RELATIONSHIP_STATUSES.OUTGOING) {
      return this.state(facts);
    }
    if (!FriendsPolicy.canRequest(facts)) {
      throw new AppException("FORBIDDEN", FRIEND_MESSAGES.CANNOT_REQUEST);
    }

    const pair = orderFriendPair(user.id, target.id);
    if (status === RELATIONSHIP_STATUSES.INCOMING) {
      await this.friendsRepository.accept(pair, new Date());
    } else {
      this.rateLimiter.consume(`friend-request:${user.id}`, REQUEST_RATE);
      const inserted = await this.friendsRepository.insertRequest(pair, user.id);
      if (!inserted) {
        // Cặp vừa có dòng giữa lúc đọc và ghi. Người kia mời cùng lúc thì thành bạn luôn (docs/api.md);
        // chính mình bấm hai lần thì giữ nguyên lời mời.
        const row = await this.friendsRepository.findPair(pair);
        if (row?.status === "PENDING" && row.requesterId !== user.id) {
          await this.friendsRepository.accept(pair, new Date());
        }
      }
    }
    return this.state(await this.facts(user.id, target));
  }

  /** Hủy lời mời đã gửi, từ chối lời mời nhận được, hoặc hủy kết bạn. Chưa có quan hệ cũng không lỗi. */
  async remove(user: SessionUser, userId: string): Promise<FriendshipState> {
    const target = await this.findTarget(user, userId, FRIEND_MESSAGES.SELF);
    await this.friendsRepository.deletePair(orderFriendPair(user.id, target.id));
    return this.state(await this.facts(user.id, target));
  }

  /** Chặn: mất quan hệ bạn bè, lời mời giữa hai người. Chặn lặp lại không lỗi. */
  async block(user: SessionUser, userId: string): Promise<FriendshipState> {
    const target = await this.findTarget(user, userId, FRIEND_MESSAGES.BLOCK_SELF);
    if (!FriendsPolicy.canBlock(user.id, target.id)) {
      throw new AppException("VALIDATION_ERROR", FRIEND_MESSAGES.BLOCK_SELF);
    }
    await this.friendsRepository.block(user.id, target.id, orderFriendPair(user.id, target.id));
    return this.state(await this.facts(user.id, target));
  }

  /** Bỏ chặn. Quan hệ bạn bè không tự quay lại. Chưa chặn cũng không lỗi. */
  async unblock(user: SessionUser, userId: string): Promise<FriendshipState> {
    const target = await this.findTarget(user, userId, FRIEND_MESSAGES.BLOCK_SELF);
    await this.friendsRepository.unblock(user.id, target.id);
    return this.state(await this.facts(user.id, target));
  }

  async listFriends(user: SessionUser, query: FriendsPageQuery): Promise<Paginated<FriendItem>> {
    const { page, pageSize } = query;
    const [rows, total] = await this.friendsRepository.findFriends(user.id, pageOf(query));
    const items = rows.map((row) => ({
      user: otherPerson(row, user.id),
      // Dòng ACCEPTED luôn có `acceptedAt`; dữ liệu cũ thiếu thì không làm hỏng cả danh sách
      since: (row.acceptedAt ?? new Date(0)).toISOString(),
    }));
    return paginate(items, total, page, pageSize);
  }

  async listRequests(
    user: SessionUser,
    query: ListFriendRequestsQuery,
  ): Promise<Paginated<FriendRequestItem>> {
    const { page, pageSize, direction } = query;
    const [rows, total] =
      direction === FRIEND_REQUEST_DIRECTIONS.OUTGOING
        ? await this.friendsRepository.findOutgoing(user.id, pageOf(query))
        : await this.friendsRepository.findIncoming(user.id, pageOf(query));
    const items = rows.map((row) => ({
      user: otherPerson(row, user.id),
      createdAt: row.createdAt.toISOString(),
    }));
    return paginate(items, total, page, pageSize);
  }

  async listBlocked(user: SessionUser, query: FriendsPageQuery): Promise<Paginated<BlockedItem>> {
    const { page, pageSize } = query;
    const [rows, total] = await this.friendsRepository.findBlocked(user.id, pageOf(query));
    const items = rows.map((row) => ({
      user: toUserSummary(row.blocked),
      blockedAt: row.createdAt.toISOString(),
    }));
    return paginate(items, total, page, pageSize);
  }

  /**
   * Người kia theo id trên đường dẫn. Id sai dạng hay không có: NOT_FOUND. Là chính mình: VALIDATION_ERROR
   * (kiểm tra trước khi truy vấn).
   */
  private async findTarget(
    user: SessionUser,
    userId: string,
    selfMessage: string,
  ): Promise<FriendTarget> {
    if (!pathIdSchema.safeParse(userId).success) {
      throw new AppException("NOT_FOUND", FRIEND_MESSAGES.USER_NOT_FOUND);
    }
    if (userId === user.id) throw new AppException("VALIDATION_ERROR", selfMessage);
    const target = await this.friendsRepository.findTarget(userId);
    if (!target) throw new AppException("NOT_FOUND", FRIEND_MESSAGES.USER_NOT_FOUND);
    return target;
  }

  /** Đọc dòng `friendship` và lượt chặn của cặp. Hồ sơ của chính mình: không truy vấn. */
  private async facts(viewerId: string, target: FriendTarget): Promise<RelationshipFacts> {
    const base = { viewerId, targetId: target.id, targetBanned: isBanned(target) };
    if (viewerId === target.id) {
      return { ...base, friendship: null, blockedByMe: false, blockedByThem: false };
    }
    const [friendship, blocks] = await Promise.all([
      this.friendsRepository.findPair(orderFriendPair(viewerId, target.id)),
      this.friendsRepository.findBlocks(viewerId, target.id),
    ]);
    return { ...base, friendship, ...blocks };
  }

  private async state(facts: RelationshipFacts): Promise<FriendshipState> {
    return {
      relationship: toRelationship(facts),
      friendCount: await this.friendsRepository.countFriends(facts.targetId),
    };
  }
}

function toRelationship(facts: RelationshipFacts): Relationship {
  return {
    status: FriendsPolicy.status(facts),
    blockedByMe: facts.blockedByMe,
    canRequest: FriendsPolicy.canRequest(facts),
  };
}

function pageOf(query: FriendsPageQuery): { skip: number; take: number } {
  return { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
}
