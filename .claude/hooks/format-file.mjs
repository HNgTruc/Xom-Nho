#!/usr/bin/env node
// PostToolUse hook: format file Claude vừa sửa bằng Prettier của project.
// Không có Prettier (chưa pnpm install) hoặc file không thuộc loại cần format thì bỏ qua êm.
// Luôn thoát mã 0: format lỗi không được làm hỏng luồng làm việc.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, resolve } from "node:path";

const FORMATTABLE = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".md",
  ".mdx",
  ".yml",
  ".yaml",
]);

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const filePath = input?.tool_input?.file_path;
  if (typeof filePath !== "string" || !filePath) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const absPath = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
  if (!existsSync(absPath) || !FORMATTABLE.has(extname(absPath).toLowerCase())) process.exit(0);

  const pkgJson = join(projectDir, "package.json");
  if (!existsSync(pkgJson)) process.exit(0);

  let prettierBin;
  try {
    prettierBin = createRequire(pkgJson).resolve("prettier/bin/prettier.cjs");
  } catch {
    process.exit(0); // Prettier chưa được cài
  }

  execFileSync(process.execPath, [prettierBin, "--write", "--log-level", "warn", absPath], {
    cwd: projectDir,
    stdio: ["ignore", "ignore", "pipe"],
    timeout: 20000,
  });
} catch {
  // bỏ qua mọi lỗi
}
process.exit(0);
