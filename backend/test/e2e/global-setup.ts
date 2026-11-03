import { execSync } from "node:child_process";

/** Chạy một lần trước mọi file e2e: tạo database test (nếu chưa có) và áp các migration. */
export default function setup(): void {
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
}
