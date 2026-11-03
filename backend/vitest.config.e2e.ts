import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// E2e chạy trên database riêng `<tên db>_test`, không bao giờ đụng database dev.
if (existsSync(".env")) process.loadEnvFile(".env");
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  if (!url.pathname.endsWith("_test")) url.pathname = `${url.pathname}_test`;
  process.env.DATABASE_URL = url.toString();
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: "./",
    include: ["**/*.e2e-spec.ts"],
    globalSetup: ["./test/e2e/global-setup.ts"],
    // Các file e2e dùng chung một database: chạy lần lượt
    fileParallelism: false,
    env: { NODE_ENV: "test", DATABASE_URL: process.env.DATABASE_URL ?? "" },
  },
});
