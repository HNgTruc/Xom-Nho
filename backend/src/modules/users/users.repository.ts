import { Injectable } from "@nestjs/common";
import type { PostStatus } from "@xom-nho/api";
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

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Hồ sơ theo username, kèm số bài ở trạng thái `postStatus`. */
  findProfile(username: string, postStatus: PostStatus): Promise<ProfileRow | null> {
    return this.prisma.user.findUnique({ where: { username }, select: profileSelect(postStatus) });
  }
}
