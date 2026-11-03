import { queryOptions } from "@tanstack/react-query";
import type { Me } from "@xom-nho/shared";
import { isApiError } from "@xom-nho/shared/api-client";
import { api } from "@/lib/api";

/** Người đang đăng nhập; chưa đăng nhập (401) hoặc bị khóa (403) thì null. */
export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async ({ signal }): Promise<Me | null> => {
    try {
      return (await api.me.get(signal)).data;
    } catch (error) {
      if (isApiError(error) && (error.status === 401 || error.status === 403)) return null;
      throw error;
    }
  },
  staleTime: 60_000,
});

export const NOT_ADMIN_MESSAGE = "Tài khoản này không có quyền vào trang quản trị.";
