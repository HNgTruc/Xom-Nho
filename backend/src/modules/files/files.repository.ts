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

/**
 * File rác: ảnh, video tải lên cho bài mà chưa gắn bài nào, tạo trước `before`. Không bao giờ chạm ảnh đại diện
 * (`AVATAR` cũng có `postId = null`), docs/co-so-du-lieu.md.
 */
function orphanWhere(before: Date): Prisma.MediaWhereInput {
  return { postId: null, purpose: "POST", createdAt: { lt: before } };
}

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

  /** Một lô file rác, cũ nhất trước. */
  findOrphans(before: Date, take: number): Promise<{ id: string; storageKey: string }[]> {
    return this.prisma.media.findMany({
      where: orphanWhere(before),
      select: { id: true, storageKey: true },
      orderBy: { createdAt: "asc" },
      take,
    });
  }

  /**
   * Xóa các dòng trong `ids` còn là file rác, trả id đã xóa thật. File vừa được gắn bài giữa lúc tìm và lúc xóa
   * không khớp điều kiện nên còn nguyên, và không nằm trong kết quả (để service không xóa nhầm file trên đĩa).
   */
  async deleteOrphans(ids: string[], before: Date): Promise<string[]> {
    if (ids.length === 0) return [];
    await this.prisma.media.deleteMany({ where: { id: { in: ids }, ...orphanWhere(before) } });
    const kept = await this.prisma.media.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const keptIds = new Set(kept.map((row) => row.id));
    return ids.filter((id) => !keptIds.has(id));
  }
}
