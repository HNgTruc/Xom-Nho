import type { Me } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { redirect } from "next/navigation";
import { cache } from "react";
import { serverApi } from "@/lib/server-api";
import { signInHref } from "../lib/sign-in-href";

/**
 * Người đang xem trang (đọc ở server), chưa đăng nhập hoặc bị khóa thì null. Lỗi khác ném tiếp.
 * `cache`: header, trang và lời chào dùng chung một lần gọi `/me` trong cùng request.
 */
export const getCurrentUser = cache(async (): Promise<Me | null> => {
  try {
    return (await serverApi.me.get()).data;
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
});

/**
 * Trang chỉ cho thành viên (ADR 0007): chưa đăng nhập thì sang trang đăng nhập, xong quay lại `next`.
 * `proxy.ts` đã chặn khách không có cookie; đây là lớp thứ hai cho cookie còn mà phiên đã hết hay bị khóa.
 * Quyền thật vẫn do backend quyết (route đọc trả 401). Đọc cookie nên nằm trong `<Suspense>`.
 */
export async function requireUser(next: string): Promise<Me> {
  const user = await getCurrentUser();
  if (!user) redirect(signInHref(next));
  return user;
}
