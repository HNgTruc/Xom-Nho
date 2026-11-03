"use client";

import type { AuthProviders } from "@xom-nho/shared";
import { Button } from "@xom-nho/ui/components/button";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "github";

const LABELS: Record<SocialProvider, string> = {
  google: "Tiếp tục với Google",
  github: "Tiếp tục với GitHub",
};

/** Nút đăng nhập Google/GitHub. Backend chưa có khóa thì nút đó không hiện (tinh-nang.md 1.2). */
export function SocialButtons({ providers, next }: { providers: AuthProviders; next: string }) {
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const enabled = (["google", "github"] as const).filter((provider) => providers[provider]);

  if (enabled.length === 0) return null;

  async function signIn(provider: SocialProvider) {
    setPending(provider);
    // Better Auth chuyển hướng sang Google/GitHub rồi quay về trang này (origin web đã có trong trustedOrigins)
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: new URL(next, window.location.origin).href,
      errorCallbackURL: new URL("/dang-nhap?loi=oauth", window.location.origin).href,
    });
    if (error) setPending(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 text-sm text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        hoặc
        <span className="h-px flex-1 bg-border" />
      </div>
      {enabled.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="w-full"
          loading={pending === provider}
          disabled={pending !== null}
          onClick={() => signIn(provider)}
        >
          {LABELS[provider]}
        </Button>
      ))}
    </div>
  );
}
