"use client";

import { type AuthProviders, authErrorMessage, signInSchema } from "@xom-nho/shared";
import { Button } from "@xom-nho/ui/components/button";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { Input } from "@xom-nho/ui/components/input";
import { Label } from "@xom-nho/ui/components/label";
import { PasswordInput } from "@xom-nho/ui/components/password-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useZodForm } from "@xom-nho/ui/hooks/use-zod-form";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { SocialButtons } from "./social-buttons";

export function SignInForm({
  next,
  providers,
  initialError,
}: {
  next: string;
  providers: AuthProviders;
  initialError?: string | null;
}) {
  const router = useRouter();
  const form = useZodForm(signInSchema, { email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(initialError ?? null);

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
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
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

      <SocialButtons providers={providers} next={next} />

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          href={{ pathname: "/dang-ky", query: next === "/" ? {} : { next } }}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
