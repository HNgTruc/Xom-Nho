import { createClient } from "@xom-nho/shared/api-client";

/**
 * api-client cho Server Components. Gọi thẳng backend từ server Next.js nên không cần CORS.
 * TODO(giai đoạn 2): chuyển tiếp cookie phiên của người dùng qua `headers`.
 */
export const serverApi = createClient({
  baseUrl: process.env.API_URL ?? "http://localhost:4000",
});
