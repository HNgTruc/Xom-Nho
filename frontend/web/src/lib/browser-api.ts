import { createClient } from "@xom-nho/api/api-client";
import { PUBLIC_API_URL } from "./env";

/** api-client cho Client Components. Trình duyệt tự gửi cookie phiên sang backend (khác cổng). */
export const browserApi = createClient({
  baseUrl: PUBLIC_API_URL,
  credentials: "include",
});
