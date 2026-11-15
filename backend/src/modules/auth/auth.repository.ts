import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

export const meSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  avatarId: true,
  bio: true,
  role: true,
  createdAt: true,
  coverId: true,
  location: true,
} as const;

export type MeRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image: string | null;
  avatarId: string | null;
  bio: string | null;
  role: string;
  createdAt: Date;
  coverId: string | null;
  location: string | null;
};

export type MeUpdateData = {
  name?: string;
  bio?: string | null;
  image?: string | null;
  avatarId?: string | null;
  coverId?: string | null;
  location?: string | null;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMe(userId: string): Promise<MeRow | null> {
    return this.prisma.user.findUnique({ where: { id: userId }, select: meSelect });
  }

  /** Ảnh đại diện đang dùng, để xóa sau khi đổi. */
  async findAvatarId(userId: string): Promise<string | null> {
    const row = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarId: true },
    });
    return row?.avatarId ?? null;
  }

  /** Ảnh bìa đang dùng, để xóa sau khi đổi hay bỏ. */
  async findCoverId(userId: string): Promise<string | null> {
    const row = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coverId: true },
    });
    return row?.coverId ?? null;
  }

  updateMe(userId: string, data: MeUpdateData): Promise<MeRow> {
    return this.prisma.user.update({ where: { id: userId }, data, select: meSelect });
  }
}
