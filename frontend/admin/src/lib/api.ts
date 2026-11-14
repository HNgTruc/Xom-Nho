import { createClient } from "@xom-nho/api/api-client";
import { API_URL } from "./env";

/** api-client của admin. `credentials: "include"` để gửi cookie phiên sang backend khác origin. */
export const api = createClient({
  baseUrl: API_URL,
  credentials: "include",
});
