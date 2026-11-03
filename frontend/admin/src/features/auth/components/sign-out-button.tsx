import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@xom-nho/ui/components/button";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    // Xóa mọi dữ liệu quản trị trong bộ nhớ đệm, không để người sau thấy
    queryClient.clear();
    navigate("/dang-nhap", { replace: true });
  }

  return (
    <Button variant="outline" size="sm" loading={pending} onClick={signOut}>
      Đăng xuất
    </Button>
  );
}
