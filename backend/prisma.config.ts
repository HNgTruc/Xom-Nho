import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 không tự đọc .env. Không dùng env() để `prisma generate` vẫn chạy khi chưa có DATABASE_URL (CI).
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
