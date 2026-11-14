import { Injectable } from "@nestjs/common";
import type { PostStatus, Role } from "@xom-nho/api";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

/** Cột cho hồ sơ công khai: không có `email`, `banned`, `banReason`. */
function profileSelect(postStatus: PostStatus) {
  return {
    id: true,
    name: true,
    username: true,
    image: true,
    avatarId: true,
    bio: true,
    role: true,
    createdAt: true,
    _count: { select: { posts: { where: { status: postStatus } } } },
  } satisfies Prisma.UserSelect;
}

export type ProfileRow = Prisma.UserGetPayload<{ select: ReturnType<typeof profileSelect> }>;

/** Cột cho bảng thành viên của trưởng xóm: có `email` và thông tin cấm, không có mật khẩu, phiên. */
const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  avatarId: true,
  role: true,
  banned: true,
  banReason: true,
  banExpires: true,
  createdAt: true,
  _count: { select: { posts: true, comments: true } },
} satisfies Prisma.UserSelect;

export type AdminUserRow = Prisma.UserGetPayload<{ select: typeof adminUserSelect }>;

/** Bộ lọc của `GET /admin/users`; trường `undefined` thì bỏ qua. `banned`: đang bị cấm tính tới `now`. */
export interface AdminUserListFilter {
  role?: Role;
  banned?: boolean;
  nameOrEmail?: string;
  now: Date;
}

/** Đang bị cấm: `banned` và chưa tới hạn mở (không có hạn = vĩnh viễn), như `isBanned` ở AuthGuard. */
function bannedWhere(banned: boolean, now: Date): Prisma.UserWhereInput {
  return banned
    ? { banned: true, OR: [{ banExpires: null }, { banExpires: { gt: now } }] }
    : { OR: [{ banned: false }, { banExpires: { lte: now } }] };
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Hồ sơ theo username, kèm số bài ở trạng thái `postStatus`. */
  findProfile(username: string, postStatus: PostStatus): Promise<ProfileRow | null> {
    return this.prisma.user.findUnique({ where: { username }, select: profileSelect(postStatus) });
  }

  /** Một trang thành viên cho bảng quản trị, mới tham gia trước. Tên, email so bằng LIKE. */
  async findAdminList(
    filter: AdminUserListFilter,
    page: { skip: number; take: number },
  ): Promise<[AdminUserRow[], number]> {
    const and: Prisma.UserWhereInput[] = [];
    if (filter.role) and.push({ role: filter.role });
    if (filter.banned !== undefined) and.push(bannedWhere(filter.banned, filter.now));
    if (filter.nameOrEmail) {
      and.push({
        OR: [
          { name: { contains: filter.nameOrEmail } },
          { email: { contains: filter.nameOrEmail } },
        ],
      });
    }
    const where: Prisma.UserWhereInput = { AND: and };
    return Promise.all([
      this.prisma.user.findMany({
        where,
        select: adminUserSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.user.count({ where }),
    ]);
  }

  /**
   * Số bài đang ẩn (`ARCHIVED`), bình luận đang ẩn (`HIDDEN`) của một người, đếm qua quan hệ của `user`. Truy vấn
   * riêng vì `_count` không chọn được cùng một quan hệ hai lần (một lần đếm hết, một lần có điều kiện).
   */
  async countHidden(id: string): Promise<{ posts: number; comments: number }> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            posts: { where: { status: "ARCHIVED" } },
            comments: { where: { status: "HIDDEN" } },
          },
        },
      },
    });
    return row?._count ?? { posts: 0, comments: 0 };
  }

  /** Số liệu màn Thành viên: tổng, mới từ `newSince`, theo vai trò, đang bị cấm tính tới `now`. */
  async stats(
    now: Date,
    newSince: Date,
  ): Promise<{
    total: number;
    newCount: number;
    banned: number;
    byRole: { role: string; count: number }[];
  }> {
    const [total, newCount, banned, roles] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: newSince } } }),
      this.prisma.user.count({ where: bannedWhere(true, now) }),
      this.prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    ]);
    return {
      total,
      newCount,
      banned,
      byRole: roles.map((row) => ({ role: row.role, count: row._count._all })),
    };
  }

  findAdminRow(id: string): Promise<AdminUserRow | null> {
    return this.prisma.user.findUnique({ where: { id }, select: adminUserSelect });
  }

  updateRole(id: string, role: Role): Promise<AdminUserRow> {
    return this.prisma.user.update({ where: { id }, data: { role }, select: adminUserSelect });
  }

  /**
   * Cấm và xóa mọi phiên của người đó trong một transaction (như `banUser` của plugin admin Better Auth): người
   * bị cấm bị đăng xuất ngay ở mọi thiết bị, request sau bị AuthGuard chặn.
   */
  async ban(id: string, reason: string, expires: Date | null): Promise<AdminUserRow> {
    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { banned: true, banReason: reason, banExpires: expires },
        select: adminUserSelect,
      }),
      this.prisma.session.deleteMany({ where: { userId: id } }),
    ]);
    return user;
  }

  unban(id: string): Promise<AdminUserRow> {
    return this.prisma.user.update({
      where: { id },
      data: { banned: false, banReason: null, banExpires: null },
      select: adminUserSelect,
    });
  }
}
