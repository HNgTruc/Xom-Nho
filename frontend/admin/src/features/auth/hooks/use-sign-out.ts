import { useQueryClient } from "@tanstack/react-query";
import { SIGN_OUT_FAILED_MESSAGE } from "@xom-nho/api";
import { toast } from "@xom-nho/ui/components/toaster";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";

/** Đăng xuất: xóa mọi dữ liệu quản trị trong bộ nhớ đệm (không để người sau thấy) rồi về trang đăng nhập. */
export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    // Mất mạng thì Better Auth ném lỗi thay vì trả `error`: phiên vẫn còn, giữ nguyên trang và báo lỗi
    const result = await authClient.signOut().catch(() => null);
    if (!result || result.error) {
      toast.error(SIGN_OUT_FAILED_MESSAGE);
      setPending(false);
      return;
    }
    queryClient.clear();
    navigate("/dang-nhap", { replace: true });
  }

  return { run, pending };
}
