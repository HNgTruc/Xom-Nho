import { createClient } from "@xom-nho/api/api-client";

/** api-client của admin. `credentials: "include"` để gửi cookie phiên sang backend khác origin. */
export const api = createClient({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  credentials: "include",
});
