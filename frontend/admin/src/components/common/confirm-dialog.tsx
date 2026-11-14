import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@xom-nho/ui/components/alert-dialog";
import { Button } from "@xom-nho/ui/components/button";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { Label } from "@xom-nho/ui/components/label";
import { Textarea } from "@xom-nho/ui/components/textarea";
import { type FormEvent, type ReactNode, useId, useState } from "react";

/**
 * Hộp xác nhận hành động nguy hiểm (pages/admin.md "Hộp thoại xác nhận"): tiêu đề nói rõ hành động, mô tả hậu quả,
 * nút nguy hiểm bên phải, "Hủy" nhận focus mặc định. `reason` thêm ô lý do bắt buộc (nút xác nhận khóa đến khi
 * có chữ). `onConfirm` trả Promise: hộp giữ mở, nút quay trong lúc gửi, xong thì đóng; lỗi thì để chỗ gọi báo.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  reason,
  children,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  /** Ô lý do bắt buộc: nhãn và ghi chú (ví dụ "bắt buộc, tác giả sẽ thấy") */
  reason?: { label: string; hint?: string; maxLength?: number };
  /** Phần thêm giữa mô tả và nút (ví dụ chọn thời hạn cấm) */
  children?: ReactNode;
  onConfirm: (reason: string) => Promise<unknown>;
}) {
  const id = useId();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const missingReason = reason !== undefined && text.trim() === "";

  function changeOpen(next: boolean) {
    if (pending) return;
    if (!next) {
      setText("");
      setError(null);
    }
    onOpenChange(next);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (missingReason) {
      setError(`Ghi ${reason.label.toLowerCase()}.`);
      return;
    }
    setPending(true);
    try {
      await onConfirm(text.trim());
      setText("");
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={changeOpen}>
      <AlertDialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          {children}

          {reason && (
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-reason`}>
                {reason.label}
                {reason.hint && (
                  <span className="font-normal text-muted-foreground"> ({reason.hint})</span>
                )}
              </Label>
              <Textarea
                id={`${id}-reason`}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError(null);
                }}
                maxLength={reason.maxLength}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-reason-error` : undefined}
                disabled={pending}
                className="min-h-24"
              />
              <FieldError id={`${id}-reason-error`}>{error}</FieldError>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              loading={pending}
              disabled={missingReason}
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
