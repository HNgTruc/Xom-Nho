import { Injectable } from "@nestjs/common";
import type { MediaKind } from "@xom-nho/api";
import type { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../infrastructure/database/prisma.service.js";

export const mediaItemSelect = {
  id: true,
  kind: true,
  mimeType: true,
} satisfies Prisma.MediaSelect;
export type MediaItemRow = Prisma.MediaGetPayload<{ select: typeof mediaItemSelect }>;

/** Phần cần để quyết định ai xem được file và gửi file. */
const mediaAccessSelect = {
  mimeType: true,
  storageKey: true,
  ownerId: true,
  purpose: true,
  post: { select: { status: true } },
} satisfies Prisma.MediaSelect;
export type MediaAccessRow = Prisma.MediaGetPayload<{ select: typeof mediaAccessSelect }>;

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    kind: MediaKind;
    purpose?: "POST" | "AVATAR";
    mimeType: string;
    sizeBytes: number;
    storageKey: string;
    ownerId: string;
  }): Promise<MediaItemRow> {
    return this.prisma.media.create({ data, select: mediaItemSelect });
  }

  findForAccess(id: string): Promise<MediaAccessRow | null> {
    return this.prisma.media.findUnique({ where: { id }, select: mediaAccessSelect });
  }

  /** Xóa dòng, trả khóa file để xóa trên đĩa; không có thì `null`. */
  async delete(id: string): Promise<string | null> {
    const row = await this.prisma.media.findUnique({ where: { id }, select: { storageKey: true } });
    if (!row) return null;
    await this.prisma.media.deleteMany({ where: { id } });
    return row.storageKey;
  }
}
