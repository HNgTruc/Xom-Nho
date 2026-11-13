import { execSync } from "node:child_process";
import { createTestPrisma } from "../fixtures/database.js";

/**
 * Chạy một lần trước mọi file e2e: tạo database test (nếu chưa có), áp các migration, rồi dựng lại bảng `post`.
 *
 * Vì sao dựng lại: test xóa bài liên tục bằng `DELETE`, nên index FULLTEXT của InnoDB giữ một danh sách dòng đã
 * xóa chờ dọn. Khi MySQL tắt không sạch (tắt Docker, tắt máy) lúc bảng đang rỗng, index có thể lệch với dữ liệu:
 * tìm ra cả bài đã xóa, bỏ sót bài mới (docs/co-so-du-lieu.md, mục Tìm kiếm tiếng Việt). `OPTIMIZE TABLE` dựng lại
 * bảng và index từ đầu; bảng test nhỏ nên chỉ mất chưa tới một giây.
 */
export default async function setup(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Thiếu DATABASE_URL: tạo backend/.env theo .env.example trước khi chạy test e2e.",
    );
  }
  if (!new URL(databaseUrl).pathname.endsWith("_test")) {
    throw new Error("Test e2e chỉ chạy trên database có đuôi _test.");
  }

  execSync("pnpm exec prisma migrate deploy", { stdio: "inherit", env: process.env });

  const prisma = createTestPrisma();
  try {
    // OPTIMIZE trả về một bảng trạng thái nên dùng $queryRaw, không dùng $executeRaw
    await prisma.$queryRaw`OPTIMIZE TABLE post`;
  } finally {
    await prisma.$disconnect();
  }
}
