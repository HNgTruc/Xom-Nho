import { z } from "zod";

/** Biến môi trường backend cần. Thiếu hoặc sai thì app dừng ngay lúc khởi động. Danh sách đầy đủ: .env.example. */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z
    .string({ error: "Thiếu DATABASE_URL" })
    .startsWith("mysql://", "DATABASE_URL phải bắt đầu bằng mysql://"),
  /** Các origin frontend được gọi API, cách nhau bằng dấu phẩy. */
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof envSchema>;
