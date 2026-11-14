import { useQueryClient } from "@tanstack/react-query";
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
    await authClient.signOut();
    queryClient.clear();
    navigate("/dang-nhap", { replace: true });
  }

  return { run, pending };
}
