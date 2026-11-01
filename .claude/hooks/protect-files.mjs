#!/usr/bin/env node
// PreToolUse hook: chặn Claude sửa các file nhạy cảm.
// Nhận JSON qua stdin; thoát mã 2 kèm lời nhắn ở stderr để chặn và báo lý do cho Claude.
//
// Chặn:
//   - .env, .env.local, .env.production... (cho phép .env.example)
//   - pnpm-lock.yaml (phải sinh ra bằng pnpm, không sửa tay)
//   - migration Prisma ĐÃ COMMIT vào git (muốn đổi schema thì tạo migration mới).
//     Migration vừa tạo bằng --create-only, chưa commit, vẫn được sửa.
//   - code Prisma client sinh tự động

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";

function block(message) {
  process.stderr.write(`[protect-files] ${message}\n`);
  process.exit(2);
}

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // không đọc được input thì không can thiệp
}

const filePath = input?.tool_input?.file_path;
if (typeof filePath !== "string" || filePath.length === 0) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const absPath = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
const rel = relative(projectDir, absPath).split("\\").join("/");
const name = basename(absPath);

if (/^\.env(\..+)?$/.test(name) && name !== ".env.example") {
  block(
    `Không sửa ${rel}: file chứa bí mật. Hãy sửa .env.example và nhắc người dùng tự cập nhật .env.`,
  );
}

if (name === "pnpm-lock.yaml") {
  block("Không sửa tay pnpm-lock.yaml. Dùng pnpm add/remove/install để lockfile tự cập nhật.");
}

function isTrackedByGit(file) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", file], {
      cwd: projectDir,
      stdio: "ignore",
    });
    return true;
  } catch (err) {
    // git trả mã 1 khi file chưa được theo dõi; lỗi khác (không có git) thì coi như đã theo dõi cho an toàn
    return err?.status === 1 ? false : true;
  }
}

if (/(^|\/)prisma\/migrations\/[^/]+\/migration\.sql$/.test(rel) && existsSync(absPath)) {
  if (isTrackedByGit(absPath)) {
    block(
      `Không sửa migration đã commit (${rel}). Sửa schema.prisma rồi tạo migration mới bằng "prisma migrate dev --name <ten>".`,
    );
  }
}

if (rel.startsWith("backend/src/generated/")) {
  block(`${rel} là code Prisma tự sinh. Sửa schema.prisma rồi chạy "prisma generate".`);
}

process.exit(0);
