import { useQuery } from "@tanstack/react-query";
import type { Me } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

/**
 * Người đang đăng nhập. Phiên lấy từ bộ nhớ an toàn của plugin Expo (mở lại app vẫn còn),
 * thông tin chi tiết (vai trò, username) lấy từ `GET /api/v1/me`.
 */
export function useMe() {
  const session = authClient.useSession();
  const signedIn = Boolean(session.data?.user);

  const me = useQuery({
    queryKey: ["me", session.data?.user.id],
    enabled: signedIn,
    queryFn: async ({ signal }): Promise<Me | null> => {
      try {
        return (await api.me.get(signal)).data;
      } catch (error) {
        if (isApiError(error) && (error.status === 401 || error.status === 403)) return null;
        throw error;
      }
    },
  });

  return {
    me: signedIn ? (me.data ?? null) : null,
    isPending: session.isPending || (signedIn && me.isPending),
    isError: me.isError,
    refetch: me.refetch,
  };
}
