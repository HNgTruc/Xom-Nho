import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { defineConfig, devices } from "@playwright/test";

/**
 * Test luồng chính của web (.claude/rules/testing.md). Playwright tự dựng một bộ riêng, không đụng máy dev:
 * - backend ở cổng 4100 trên database `<tên db>_test` (như test e2e của backend), có dữ liệu mẫu để có danh mục;
 * - web bản production (`next build` + `next start`) ở cổng 3100, build vào `.next-e2e/`.
 * Nhờ vậy chạy được khi `pnpm dev` đang mở ở 3000/4000. Cần MySQL đang chạy (`pnpm db:up`).
 */
const WEB_PORT = 3100;
const API_PORT = 4100;
const WEB_URL = `http://localhost:${WEB_PORT}`;
const API_URL = `http://localhost:${API_PORT}`;
const repoRoot = join(import.meta.dirname, "../..");

/** DATABASE_URL lấy từ môi trường hoặc backend/.env, luôn đổi sang database `_test`. Chỉ đọc biến này. */
function testDatabaseUrl(): string {
  const envFile = join(repoRoot, "backend/.env");
  const raw =
    process.env.DATABASE_URL ??
    (existsSync(envFile) ? parseEnv(readFileSync(envFile, "utf8")).DATABASE_URL : undefined);
  if (!raw) {
    throw new Error("Thiếu DATABASE_URL: tạo backend/.env theo .env.example trước khi chạy test.");
  }
  const url = new URL(raw);
  if (!url.pathname.endsWith("_test")) url.pathname = `${url.pathname}_test`;
  return url.toString();
}

export default defineConfig({
  testDir: "./e2e",
  // Đuôi .e2e.ts để Vitest của web (`pnpm --filter web test`) không chạy nhầm
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: WEB_URL,
    locale: "vi-VN",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      name: "backend",
      command: "pnpm --filter @xom-nho/api build && pnpm --filter backend e2e:serve",
      cwd: repoRoot,
      url: `${API_URL}/api/v1/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: "pipe",
      // Cấu hình cố định cho test, như backend/vitest.config.e2e.ts (trừ cổng và origin của web e2e)
      env: {
        NODE_ENV: "test",
        PORT: String(API_PORT),
        DATABASE_URL: testDatabaseUrl(),
        BETTER_AUTH_SECRET: "e2e-chi-dung-cho-test-khong-dung-o-dau-khac",
        BETTER_AUTH_URL: API_URL,
        CORS_ORIGINS: WEB_URL,
        GOOGLE_CLIENT_ID: "",
        GOOGLE_CLIENT_SECRET: "",
        GITHUB_CLIENT_ID: "",
        GITHUB_CLIENT_SECRET: "",
        UPLOAD_DIR: join(repoRoot, "backend/dist-e2e/media"),
      },
    },
    {
      name: "web",
      command: `pnpm exec next build && pnpm exec next start --port ${WEB_PORT}`,
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: 300_000,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        API_URL,
        NEXT_PUBLIC_API_URL: API_URL,
        SITE_URL: WEB_URL,
      },
    },
  ],
});
