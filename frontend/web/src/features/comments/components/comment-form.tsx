"use client";

import { LIMITS, updateCommentSchema } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { Label } from "@xom-nho/ui/components/label";
import { Textarea } from "@xom-nho/ui/components/textarea";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

/**
 * Ô viết bình luận, dùng cho bình luận mới, trả lời và sửa. Kiểm tra bằng cùng schema với backend.
 * Ctrl/Cmd + Enter để gửi, Esc để hủy (khi có nút Hủy). `onSubmit` trả câu lỗi, hoặc `null` khi đã gửi xong.
 */
export function CommentForm({
  id,
  label,
  submitLabel,
  initialValue = "",
  focusOnMount = false,
  onSubmit,
  onCancel,
}: {
  id: string;
  label: string;
  submitLabel: string;
  initialValue?: string;
  /** Đưa con trỏ vào ô khi mở (người dùng vừa bấm "Trả lời", "Sửa") */
  focusOnMount?: boolean;
  onSubmit: (content: string) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const errorId = `${id}-error`;

  // Mở ô trả lời, ô sửa: đưa con trỏ vào cuối chữ (sau "@tên ")
  useEffect(() => {
    if (!focusOnMount) return;
    const textarea = textareaRef.current;
    textarea?.focus();
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [focusOnMount]);

  async function submit() {
    if (pending) return;
    const parsed = updateCommentSchema.safeParse({ content: value });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? null);
      textareaRef.current?.focus();
      return;
    }

    setPending(true);
    setError(null);
    const problem = await onSubmit(parsed.data.content);
    setPending(false);
    if (problem) {
      setError(problem);
      textareaRef.current?.focus();
    } else {
      setValue("");
    }
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void submit();
    } else if (event.key === "Escape" && onCancel) {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        maxLength={LIMITS.COMMENT_MAX}
        disabled={pending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="min-h-20"
      />
      <FieldError id={errorId} role="alert">
        {error}
      </FieldError>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
            Hủy
          </Button>
        )}
      </div>
    </form>
  );
}
