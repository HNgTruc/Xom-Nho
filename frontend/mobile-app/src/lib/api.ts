import { createClient } from "@xom-nho/shared/api-client";
import { authClient } from "./auth-client";
import { backendUrl, backendUrlOrInvalid } from "./backend-url";

export const apiUrl = backendUrl;

/**
 * api-client của app. App không có cookie như trình duyệt: lấy cookie phiên plugin Expo đã lưu,
 * gửi bằng header Cookie, và đặt `credentials: "omit"` (tài liệu Better Auth cho Expo).
 */
export const api = createClient({
  baseUrl: backendUrlOrInvalid,
  credentials: "omit",
  headers: async (): Promise<Record<string, string>> => {
    const cookie = await authClient.getCookie();
    return cookie ? { cookie } : {};
  },
});
