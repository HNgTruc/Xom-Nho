import { existsSync } from "node:fs";
import { z } from "zod";
import { type Env, envSchema } from "./env.schema.js";

/**
 * Đọc `backend/.env` (nếu có, biến đã đặt sẵn trong môi trường được giữ nguyên) rồi kiểm tra bằng schema.
 * Sai thì ném lỗi liệt kê từng biến, để app không chạy nửa vời với cấu hình hỏng.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env, envFile = ".env"): Env {
  if (source === process.env && existsSync(envFile)) process.loadEnvFile(envFile);

  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Biến môi trường không hợp lệ:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
