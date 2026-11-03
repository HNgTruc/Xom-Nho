import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { AppButton } from "@/components/app-button";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { space } from "@/theme";

type SocialProvider = "google" | "github";

const LABELS: Record<SocialProvider, string> = {
  google: "Tiếp tục với Google",
  github: "Tiếp tục với GitHub",
};

/** Google/GitHub: backend chưa có khóa thì không hiện nút. Plugin Expo mở trình duyệt rồi quay về app (xomnho://). */
export function SocialButtons({
  onError,
  onSuccess,
}: {
  onError: (message: string) => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const providers = useQuery({
    queryKey: ["auth-providers"],
    queryFn: ({ signal }) => api.auth.providers(signal),
  });
  const enabled = (["google", "github"] as const).filter(
    (provider) => providers.data?.data[provider],
  );

  if (enabled.length === 0) return null;

  async function signIn(provider: SocialProvider) {
    setPending(provider);
    const { error } = await authClient.signIn.social({ provider, callbackURL: "/" });
    setPending(null);
    if (error) {
      onError("Chưa đăng nhập được bằng tài khoản này. Bạn thử lại hoặc dùng email nhé.");
      return;
    }
    // Trên app, Better Auth không tự chuyển màn hình sau khi đăng nhập mạng xã hội
    onSuccess();
    router.replace("/");
  }

  return (
    <View style={{ gap: space[2] }}>
      {enabled.map((provider) => (
        <AppButton
          key={provider}
          label={LABELS[provider]}
          variant="outline"
          loading={pending === provider}
          disabled={pending !== null}
          onPress={() => signIn(provider)}
        />
      ))}
    </View>
  );
}
