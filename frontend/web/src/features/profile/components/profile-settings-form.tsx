"use client";

import { ERROR_MESSAGES, profileFieldsSchema, SETTINGS_MESSAGES } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { Button } from "@xom-nho/ui/components/button";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { Input } from "@xom-nho/ui/components/input";
import { Label } from "@xom-nho/ui/components/label";
import { Textarea } from "@xom-nho/ui/components/textarea";
import { useZodForm } from "@xom-nho/ui/hooks/use-zod-form";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { browserApi } from "@/lib/browser-api";

const formSchema = profileFieldsSchema.pick({ name: true, bio: true });

/**
 * Sửa tên và giới thiệu (docs/tinh-nang.md mục 1.4), kiểm tra bằng cùng schema với backend.
 * Chỉ gửi ô đã đổi; không đổi gì thì báo, không gọi API. Lưu xong làm mới trang để header, hồ sơ cập nhật.
 * Ảnh đại diện, ảnh bìa, nơi ở, đổi mật khẩu thêm ở giai đoạn 4b.
 */
export function ProfileSettingsForm({ initial }: { initial: { name: string; bio: string } }) {
  const router = useRouter();
  const form = useZodForm(formSchema, initial);
  const [saved, setSaved] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = form.validateAll();
    if (!input) return;

    const changes = {
      ...(form.values.name !== saved.name && { name: input.name }),
      ...(form.values.bio !== saved.bio && { bio: input.bio }),
    };
    if (Object.keys(changes).length === 0) {
      setMessage({ tone: "success", text: SETTINGS_MESSAGES.NO_CHANGE });
      return;
    }

    setPending(true);
    setMessage(null);
    try {
      await browserApi.me.update(changes);
      setSaved(form.values);
      setMessage({ tone: "success", text: SETTINGS_MESSAGES.SAVED });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: isApiError(error) ? error.message : ERROR_MESSAGES.INTERNAL_ERROR,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {message?.tone === "error" && <FormAlert message={message.text} />}
      {message?.tone === "success" && (
        <output className="block rounded-md bg-accent px-4 py-3 text-base text-accent-foreground">
          {message.text}
        </output>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Tên hiển thị</Label>
        <Input {...form.field("name")} autoComplete="name" disabled={pending} />
        <FieldError id="name-error">{form.errors.name}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Giới thiệu</Label>
        <Textarea {...form.field("bio")} rows={4} disabled={pending} />
        <FieldError id="bio-error">{form.errors.bio}</FieldError>
      </div>

      <Button type="submit" className="self-start" loading={pending}>
        Lưu thay đổi
      </Button>
    </form>
  );
}
