import { useQueryClient } from "@tanstack/react-query";
import { authErrorMessage, LIMITS, signUpSchema } from "@xom-nho/shared";
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

export function SignUpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm(signUpSchema, { name: "", email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit() {
    const input = form.validateAll();
    if (!input) return;

    setPending(true);
    setFormError(null);
    const { error } = await authClient.signUp.email(input);
    setPending(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    router.replace("/");
  }

  return (
    <AuthScreen title="Làm hàng xóm" subtitle="Tạo tài khoản để viết bài và trò chuyện cùng xóm.">
      <FormAlert message={formError} />
      <TextField
        label="Tên hiển thị"
        {...form.field("name")}
        error={form.errors.name}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        editable={!pending}
      />
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
        hint={`Ít nhất ${LIMITS.PASSWORD_MIN} ký tự.`}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        editable={!pending}
      />
      <AppButton label="Đăng ký" onPress={onSubmit} loading={pending} />
      <SocialButtons
        onError={setFormError}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["me"] })}
      />
      <Link
        href="/dang-nhap"
        replace
        style={[
          text.base,
          { color: colors.primary, fontWeight: weight.semibold, paddingVertical: 12 },
        ]}
      >
        Đã có tài khoản? Đăng nhập
      </Link>
    </AuthScreen>
  );
}
