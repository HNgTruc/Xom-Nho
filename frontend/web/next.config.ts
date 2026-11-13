import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Test Playwright build vào thư mục riêng (playwright.config.ts), không đè bản build thường
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  // ui xuất thẳng file .tsx, không có bước build
  transpilePackages: ["@xom-nho/ui"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
