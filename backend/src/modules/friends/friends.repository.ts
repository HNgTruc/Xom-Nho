import { Injectable } from "@nestjs/common";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

/** Khóa một cặp trong bảng `friendship`, luôn dựng bằng `orderFriendPair`. */
export interface FriendPair {
  userLowId: string;
  userHighId: string;
}

/** Cột của người trong danh sách: như `UserSummary`, không có `email`. */
const summarySelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  avatarId: true,
} satisfies Prisma.UserSelect;

export type SummaryRow = Prisma.UserGetPayload<{ select: typeof summarySelect }>;

/** Phần của người kia mà service cần để quyết định: có tồn tại không, có đang bị cấm không. */
export interface FriendTargetRow {
  id: string;
  banned: boolean;
  banExpires: Date | null;
}

export interface FriendshipRow {
  requesterId: string;
  status: "PENDING" | "ACCEPTED";
}

/** Một dòng có cả hai người của cặp; service chọn người không phải mình. */
export interface PairPeopleRow {
  userLow: SummaryRow;
  userHigh: SummaryRow;
}

export interface Page {
  skip: number;
  take: number;
}

/** Quan hệ của một người: người đó có thể nằm ở cột nào cũng được (docs/co-so-du-lieu.md). */
function involving(userId: string): Prisma.FriendshipWhereInput {
  return { OR: [{ userLowId: userId }, { userHighId: userId }] };
}

const pairPeopleSelect = {
  userLow: { select: summarySelect },
  userHigh: { select: summarySelect },
} satisfies Prisma.FriendshipSelect;

@Injectable()
export class FriendsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTarget(id: string): Promise<FriendTargetRow | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, banned: true, banExpires: true },
    });
  }

  findPair(pair: FriendPair): Promise<FriendshipRow | null> {
    return this.prisma.friendship.findUnique({
      where: { userLowId_userHighId: pair },
      select: { requesterId: true, status: true },
    });
  }

  /** Lượt chặn giữa hai người, cả hai chiều, trong một truy vấn. */
  async findBlocks(
    viewerId: string,
    targetId: string,
  ): Promise<{ blockedByMe: boolean; blockedByThem: boolean }> {
    const rows = await this.prisma.userBlock.findMany({
      where: {
        OR: [
          { blockerId: viewerId, blockedId: targetId },
          { blockerId: targetId, blockedId: viewerId },
        ],
      },
      select: { blockerId: true },
    });
    return {
      blockedByMe: rows.some((row) => row.blockerId === viewerId),
      blockedByThem: rows.some((row) => row.blockerId === targetId),
    };
  }

  /**
   * Ghi lời mời mới. `INSERT IGNORE`: nếu cặp đã có dòng (người kia vừa mời cùng lúc, hay bấm hai lần) thì không
   * ghi và trả `false`, service đọc lại để quyết định.
   */
  async insertRequest(pair: FriendPair, requesterId: string): Promise<boolean> {
    const { count } = await this.prisma.friendship.createMany({
      data: [{ ...pair, requesterId }],
      skipDuplicates: true,
    });
    return count === 1;
  }

  /** Chấp nhận lời mời đang chờ của cặp. Đã chấp nhận rồi thì không đổi `acceptedAt`. */
  async accept(pair: FriendPair, at: Date): Promise<void> {
    await this.prisma.friendship.updateMany({
      where: { ...pair, status: "PENDING" },
      data: { status: "ACCEPTED", acceptedAt: at },
    });
  }

  /** Hủy lời mời, từ chối, hủy kết bạn: đều là xóa dòng của cặp. Không có dòng cũng không lỗi. */
  async deletePair(pair: FriendPair): Promise<void> {
    await this.prisma.friendship.deleteMany({ where: pair });
  }

  countFriends(userId: string): Promise<number> {
    return this.prisma.friendship.count({ where: { status: "ACCEPTED", ...involving(userId) } });
  }

  /** Bạn bè của một người, mới kết bạn trước; thêm khóa cặp để thứ tự ổn định giữa các trang. */
  findFriends(
    userId: string,
    page: Page,
  ): Promise<[(PairPeopleRow & { acceptedAt: Date | null })[], number]> {
    const where: Prisma.FriendshipWhereInput = { status: "ACCEPTED", ...involving(userId) };
    return Promise.all([
      this.prisma.friendship.findMany({
        where,
        select: { ...pairPeopleSelect, acceptedAt: true },
        orderBy: [{ acceptedAt: "desc" }, { userLowId: "asc" }, { userHighId: "asc" }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.friendship.count({ where }),
    ]);
  }

  /** Lời mời người khác gửi cho mình, mới trước. */
  findIncoming(
    userId: string,
    page: Page,
  ): Promise<[(PairPeopleRow & { createdAt: Date })[], number]> {
    const where: Prisma.FriendshipWhereInput = {
      status: "PENDING",
      requesterId: { not: userId },
      ...involving(userId),
    };
    return this.findRequests(where, page);
  }

  /** Lời mời mình đã gửi, mới trước (chỉ mục `requesterId, status, createdAt`). */
  findOutgoing(
    userId: string,
    page: Page,
  ): Promise<[(PairPeopleRow & { createdAt: Date })[], number]> {
    return this.findRequests({ status: "PENDING", requesterId: userId }, page);
  }

  /**
   * Chặn: xóa quan hệ bạn bè, lời mời của cặp và ghi lượt chặn trong cùng transaction. Chặn lặp lại không sinh
   * dòng mới (`INSERT IGNORE`).
   */
  async block(blockerId: string, blockedId: string, pair: FriendPair): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.friendship.deleteMany({ where: pair }),
      this.prisma.userBlock.createMany({ data: [{ blockerId, blockedId }], skipDuplicates: true }),
    ]);
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    await this.prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
  }

  /** Người mình đã chặn, mới trước. */
  findBlocked(
    blockerId: string,
    page: Page,
  ): Promise<[{ blocked: SummaryRow; createdAt: Date }[], number]> {
    const where: Prisma.UserBlockWhereInput = { blockerId };
    return Promise.all([
      this.prisma.userBlock.findMany({
        where,
        select: { blocked: { select: summarySelect }, createdAt: true },
        orderBy: [{ createdAt: "desc" }, { blockedId: "asc" }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.userBlock.count({ where }),
    ]);
  }

  private findRequests(
    where: Prisma.FriendshipWhereInput,
    page: Page,
  ): Promise<[(PairPeopleRow & { createdAt: Date })[], number]> {
    return Promise.all([
      this.prisma.friendship.findMany({
        where,
        select: { ...pairPeopleSelect, createdAt: true },
        orderBy: [{ createdAt: "desc" }, { userLowId: "asc" }, { userHighId: "asc" }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.friendship.count({ where }),
    ]);
  }
}
