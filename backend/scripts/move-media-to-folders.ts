/**
 * Chuyển ảnh, video tải lên từ thư mục cũ `backend/uploads/` (khóa `<uuid>.<đuôi>`) sang `UPLOAD_DIR`
 * chia thư mục con (`images/`, `videos/`; khóa `<thư mục>/<uuid>.<đuôi>`).
 *
 *   pnpm --filter backend media:move                 # nguồn mặc định: uploads (tức backend/uploads)
 *   pnpm --filter backend media:move -- --from <dir>  # nguồn khác
 *
 * Làm từng dòng `media`: chuyển file rồi mới sửa `storageKey`, nên dừng giữa chừng thì chạy lại là tiếp tục.
 * Không xóa file nào; file trong thư mục cũ mà database không nhắc tới thì chỉ liệt kê.
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, rename, rm, rmdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { loadEnv } from "../src/config/load-env.js";
import { createPrismaClient } from "../src/infrastructure/database/create-prisma-client.js";
import {
  isStorageKey,
  resolveUploadRoot,
  type StorageFolder,
} from "../src/infrastructure/storage/storage.service.js";

const FOLDER: Record<"IMAGE" | "VIDEO", StorageFolder> = { IMAGE: "images", VIDEO: "videos" };

const { values } = parseArgs({ options: { from: { type: "string", default: "uploads" } } });
const env = loadEnv();
const source = resolve(values.from);
const target = resolveUploadRoot(env.UPLOAD_DIR);

if (source === target) {
  throw new Error(
    `UPLOAD_DIR vẫn trỏ vào thư mục cũ (${source}). Sửa UPLOAD_DIR=../media trong backend/.env (hoặc xóa dòng đó) rồi chạy lại.`,
  );
}

/** Đổi chỗ file; khác ổ đĩa thì chép rồi xóa. */
async function moveFile(from: string, to: string): Promise<void> {
  await mkdir(dirname(to), { recursive: true });
  try {
    await rename(from, to);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") throw error;
    await copyFile(from, to);
    await rm(from);
  }
}

const prisma = createPrismaClient(env.DATABASE_URL);

try {
  console.info(`Nguồn: ${source}\nĐích:  ${target}\n`);

  const rows = await prisma.media.findMany({
    where: { NOT: { storageKey: { contains: "/" } } },
    select: { id: true, kind: true, storageKey: true },
  });

  let moved = 0;
  let resumed = 0;
  const missing: string[] = [];

  for (const row of rows) {
    const newKey = `${FOLDER[row.kind]}/${row.storageKey}`;
    if (!isStorageKey(newKey)) {
      missing.push(`${row.storageKey} (khóa không hợp lệ, bỏ qua)`);
      continue;
    }
    const from = join(source, row.storageKey);
    const to = join(target, newKey);

    if (existsSync(from)) {
      await moveFile(from, to);
      moved++;
    } else if (existsSync(to)) {
      // Lần trước đã chuyển file nhưng chưa kịp sửa database
      resumed++;
    } else {
      missing.push(`${row.storageKey} (không thấy file ở cả hai nơi)`);
      continue;
    }
    await prisma.media.update({ where: { id: row.id }, data: { storageKey: newKey } });
  }

  console.info(`Đã chuyển ${moved} file, cập nhật tiếp ${resumed} dòng còn dở.`);
  if (missing.length > 0) {
    console.info(`\nKhông chuyển được ${missing.length} dòng:`);
    for (const line of missing) console.info(`  - ${line}`);
  }

  if (existsSync(source)) {
    const leftovers = await readdir(source);
    if (leftovers.length === 0) {
      await rmdir(source);
      console.info(`\nThư mục cũ đã trống, đã xóa: ${source}`);
    } else {
      console.info(`\nThư mục cũ còn ${leftovers.length} file database không dùng (không xóa):`);
      for (const name of leftovers) console.info(`  - ${name}`);
    }
  }

  if (missing.length > 0) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
