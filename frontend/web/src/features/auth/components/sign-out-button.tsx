"use client";

import { Button } from "@xom-nho/ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.refresh();
    setPending(false);
  }

  return (
    <Button variant="ghost" size="sm" loading={pending} onClick={signOut}>
      Đăng xuất
    </Button>
  );
}
