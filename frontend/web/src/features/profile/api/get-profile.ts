import type { PublicProfile } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { cache } from "react";
import { publicApi } from "@/lib/server-api";

/**
 * Hồ sơ công khai cho trang `/u/<username>`. Không có thì `null` (trang gọi `notFound()`); lỗi khác ném tiếp.
 * Dữ liệu công khai nên không gửi cookie. `cache` để `generateMetadata` và trang dùng chung một lần gọi.
 */
export const getProfile = cache(async (username: string): Promise<PublicProfile | null> => {
  try {
    return (await publicApi.users.get(username)).data;
  } catch (error) {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  }
});
