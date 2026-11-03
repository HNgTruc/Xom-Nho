import { useQueryClient } from "@tanstack/react-query";
import { authErrorMessage, signInSchema } from "@xom-nho/shared";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { AppButton } from "@/components/app-button";
import { TextField } from "@/components/text-field";
import { authClient } from "@/lib/auth-client";
import { text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";
import { useForm } from "../hooks/use-form";
import { AuthScreen } from "./auth-screen";
import { FormAlert } from "./form-alert";
import { SocialButtons } from "./social-buttons";

export function SignInScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm(signInSchema, { email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit() {
    const input = form.validateAll();
    if (!input) return;

    setPending(true);
    setFormError(null);
    const { error } = await authClient.signIn.email(input);
    setPending(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    router.replace("/");
  }

  return (
    <AuthScreen title="Đăng nhập" subtitle="Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.">
      <FormAlert message={formError} />
      <TextField
        label="Email"
        {...form.field("email")}
        error={form.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        editable={!pending}
      />
      <TextField
        label="Mật khẩu"
        secure
        {...form.field("password")}
        error={form.errors.password}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        editable={!pending}
      />
      <AppButton label="Đăng nhập" onPress={onSubmit} loading={pending} />
      <SocialButtons
        onError={setFormError}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["me"] })}
      />
      <Link
        href="/dang-ky"
        replace
        style={[
          text.base,
          { color: colors.primary, fontWeight: weight.semibold, paddingVertical: 12 },
        ]}
      >
        Chưa có tài khoản? Đăng ký
      </Link>
    </AuthScreen>
  );
}
