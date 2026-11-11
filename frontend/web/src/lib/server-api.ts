import { createClient } from "@xom-nho/api/api-client";
import { cookies } from "next/headers";

const baseUrl = process.env.API_URL ?? "http://localhost:4000";

/**
 * api-client cho Server Components. Gọi thẳng backend từ server Next.js (không cần CORS) và
 * chuyển tiếp cookie của người đang xem, để backend biết ai đang đăng nhập.
 * Mọi dữ liệu đều cần đăng nhập (ADR 0007), nên không có client "công khai" không gửi cookie.
 * Đọc cookie là dữ liệu lúc có request: component dùng nó phải nằm trong `<Suspense>` (Cache Components).
 */
export const serverApi = createClient({
  baseUrl,
  headers: async () => ({ cookie: (await cookies()).toString() }),
});
