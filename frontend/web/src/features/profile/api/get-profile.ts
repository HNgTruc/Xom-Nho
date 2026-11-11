import type { PublicProfile } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { cache } from "react";
import { serverApi } from "@/lib/server-api";

/**
 * Hồ sơ (phần ai trong xóm cũng thấy) cho trang `/u/<username>`. Không có thì `null` (trang gọi `notFound()`); lỗi khác ném tiếp.
 * Gửi cookie của người đang xem (backend chỉ trả cho thành viên). `cache` để `generateMetadata` và trang dùng chung một lần gọi.
 */
export const getProfile = cache(async (username: string): Promise<PublicProfile | null> => {
  try {
    return (await serverApi.users.get(username)).data;
  } catch (error) {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  }
});
