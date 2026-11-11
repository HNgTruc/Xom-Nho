import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@xom-nho/api/api-client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Lỗi 4xx (sai quyền, không tìm thấy) thử lại cũng vậy; chỉ thử lại lỗi mạng, lỗi máy chủ
      retry: (failureCount, error) =>
        failureCount < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
    },
  },
});
