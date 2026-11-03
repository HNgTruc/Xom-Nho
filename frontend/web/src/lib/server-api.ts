import { createClient } from "@xom-nho/shared/api-client";
import { cookies } from "next/headers";

const baseUrl = process.env.API_URL ?? "http://localhost:4000";

/**
 * api-client cho Server Components. Gọi thẳng backend từ server Next.js (không cần CORS) và
 * chuyển tiếp cookie của người đang xem, để backend biết ai đang đăng nhập.
 * Đọc cookie là dữ liệu lúc có request: component dùng nó phải nằm trong `<Suspense>` (Cache Components).
 */
export const serverApi = createClient({
  baseUrl,
  headers: async () => ({ cookie: (await cookies()).toString() }),
});

/**
 * api-client cho dữ liệu công khai (danh sách bài, danh mục, tag): không gửi cookie, ai xem cũng ra như nhau.
 * Không đọc cookie nên sau này bọc `"use cache"` được mà không lẫn dữ liệu giữa người dùng.
 */
export const publicApi = createClient({ baseUrl });
