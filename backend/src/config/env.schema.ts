import { z } from "zod";

/** Chuỗi rỗng trong .env coi như không đặt (ví dụ GOOGLE_CLIENT_ID= để trống). */
const optionalString = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

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

  BETTER_AUTH_SECRET: z
    .string({ error: "Thiếu BETTER_AUTH_SECRET (lệnh tạo có trong .env.example)" })
    .min(32, "BETTER_AUTH_SECRET cần ít nhất 32 ký tự (lệnh tạo có trong .env.example)"),
  /** Địa chỉ công khai của backend, dùng để tạo link quay về khi đăng nhập Google/GitHub. */
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL phải là URL").default("http://localhost:4000"),
  /** Scheme của app Expo (trùng "scheme" trong app.json), để Better Auth tin link quay về app. */
  MOBILE_APP_SCHEME: z.string().min(1).default("xomnho"),
  /** Thư mục lưu ảnh, video tải lên (ADR 0005), tương đối với thư mục chạy backend: mặc định `media/` ở gốc repo. */
  UPLOAD_DIR: z.string().min(1).default("../media"),

  // Để trống thì tắt đăng nhập bằng nhà cung cấp đó, frontend ẩn nút
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  GITHUB_CLIENT_ID: optionalString,
  GITHUB_CLIENT_SECRET: optionalString,
});

export type Env = z.infer<typeof envSchema>;
