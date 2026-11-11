import type { Me } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { serverApi } from "@/lib/server-api";

/** Người đang xem trang (đọc ở server), chưa đăng nhập hoặc bị khóa thì null. Lỗi khác ném tiếp. */
export async function getCurrentUser(): Promise<Me | null> {
  try {
    return (await serverApi.me.get()).data;
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
}
