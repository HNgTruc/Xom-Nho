import { createClient } from "@xom-nho/shared/api-client";
import { cookies } from "next/headers";

/**
 * api-client cho Server Components. Gọi thẳng backend từ server Next.js (không cần CORS) và
 * chuyển tiếp cookie của người đang xem, để backend biết ai đang đăng nhập.
 * Đọc cookie là dữ liệu lúc có request: component dùng nó phải nằm trong `<Suspense>` (Cache Components).
 */
export const serverApi = createClient({
  baseUrl: process.env.API_URL ?? "http://localhost:4000",
  headers: async () => ({ cookie: (await cookies()).toString() }),
});
