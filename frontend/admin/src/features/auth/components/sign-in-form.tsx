import { useQueryClient } from "@tanstack/react-query";
import { authErrorMessage, ROLES, signInSchema } from "@xom-nho/shared";
import { Button } from "@xom-nho/ui/components/button";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { Input } from "@xom-nho/ui/components/input";
import { Label } from "@xom-nho/ui/components/label";
import { PasswordInput } from "@xom-nho/ui/components/password-input";
import { useZodForm } from "@xom-nho/ui/hooks/use-zod-form";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { meQuery, NOT_ADMIN_MESSAGE } from "../api/me.queries";

/**
 * Đăng nhập trang quản trị. Đăng nhập được nhưng không phải trưởng xóm thì đăng xuất ngay và báo lỗi
 * (chỉ để trải nghiệm tốt hơn; backend vẫn trả 403 cho mọi /api/v1/admin/*).
 */
export function SignInForm({ next, initialError }: { next: string; initialError: string | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useZodForm(signInSchema, { email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(initialError);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = form.validateAll();
    if (!input) return;

    setPending(true);
    setFormError(null);
    const { error } = await authClient.signIn.email(input);
    if (error) {
      setFormError(authErrorMessage(error));
      setPending(false);
      return;
    }

    const me = await queryClient.fetchQuery({ ...meQuery, staleTime: 0 });
    if (me?.role !== ROLES.ADMIN) {
      await authClient.signOut();
      queryClient.setQueryData(meQuery.queryKey, null);
      setFormError(NOT_ADMIN_MESSAGE);
      setPending(false);
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormAlert message={formError} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...form.field("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          disabled={pending}
        />
        <FieldError id="email-error">{form.errors.email}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <PasswordInput
          {...form.field("password")}
          autoComplete="current-password"
          disabled={pending}
        />
        <FieldError id="password-error">{form.errors.password}</FieldError>
      </div>

      <Button type="submit" className="w-full" loading={pending}>
        Đăng nhập
      </Button>
    </form>
  );
}
