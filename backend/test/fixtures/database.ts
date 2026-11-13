import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createPrismaClient } from "../../src/infrastructure/database/create-prisma-client.js";

/** Client trỏ vào database test (vitest.config.e2e.ts đã đổi DATABASE_URL sang `_test`). */
export function createTestPrisma(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test")) {
    throw new Error("Chỉ dọn dữ liệu trên database có đuôi _test.");
  }
  return createPrismaClient(databaseUrl);
}

/** Xóa sạch dữ liệu, theo thứ tự con trước cha để không vướng khóa ngoại. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.postLike.deleteMany(),
    prisma.postDislike.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.media.deleteMany(),
    prisma.postTag.deleteMany(),
    prisma.post.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.category.deleteMany(),
    // session, account xóa theo user (onDelete: Cascade)
    prisma.user.deleteMany(),
    prisma.verification.deleteMany(),
  ]);
}
