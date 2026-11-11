import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Schema và migration nằm ở database/prisma (ngoài backend); đường dẫn tính từ file này.
// Prisma 7 không tự đọc .env. Không dùng env() để `prisma generate` vẫn chạy khi chưa có DATABASE_URL (CI).
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "../database/prisma/schema.prisma",
  migrations: {
    path: "../database/prisma/migrations",
    seed: "tsx scripts/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
