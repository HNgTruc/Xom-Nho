import { createClient } from "@xom-nho/api/api-client";

/** api-client cho Client Components. Trình duyệt tự gửi cookie phiên sang backend (khác cổng). */
export const browserApi = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  credentials: "include",
});
