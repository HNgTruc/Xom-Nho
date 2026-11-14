import { LIMITS, POST_HIDE_REASONS } from "@xom-nho/api";
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
import { type FormEvent, useId, useState } from "react";

const OTHER = "Lý do khác";
const CHOICES = [...POST_HIDE_REASONS, OTHER];

/** Lý do gửi lên API: lý do chọn nhanh, kèm phần ghi thêm nếu có; "Lý do khác" thì chính là phần ghi thêm. */
function composeReason(choice: string, note: string): string {
  const extra = note.trim();
  if (choice === OTHER) return extra;
  return extra ? `${choice}: ${extra}` : choice;
}

/**
 * Hộp ẩn bài (pages/admin.md "Ẩn bài", bản thiết kế màn Bài mới): lý do bắt buộc, tác giả sẽ thấy. Chọn nhanh một
 * trong các lý do thường gặp hoặc "Lý do khác" (khi đó bắt buộc ghi thêm). Nút "Ẩn bài" là nút viền thường, không
 * đỏ: ẩn hiện lại được (admin.md "Màu chỉ cho trạng thái và việc không đảo ngược được"). Dùng cho một hay nhiều bài.
 */
export function HidePostDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Ẩn bài của Lan Anh?" hoặc "Ẩn 3 bài?" */
  title: string;
  onConfirm: (reason: string) => Promise<unknown>;
}) {
  const id = useId();
  const [choice, setChoice] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reason = choice ? composeReason(choice, note) : "";
  const tooLong = reason.length > LIMITS.MODERATION_REASON_MAX;

  function reset() {
    setChoice(null);
    setNote("");
    setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!choice) return setError("Chọn lý do ẩn bài.");
    if (choice === OTHER && note.trim() === "") return setError("Ghi lý do ẩn bài.");
    if (tooLong) return setError(`Lý do tối đa ${LIMITS.MODERATION_REASON_MAX} ký tự.`);
    setPending(true);
    try {
      await onConfirm(reason);
      reset();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              Hàng xóm sẽ không thấy bài nữa. Tác giả vẫn thấy bài kèm lý do bên dưới. Bạn hiện lại
              được bất cứ lúc nào ở mục Bài viết.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <fieldset
            className="flex flex-col gap-1"
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <legend className="mb-2 text-sm font-medium">
              Lý do{" "}
              <span className="font-normal text-muted-foreground">(bắt buộc, tác giả sẽ thấy)</span>
            </legend>
            {CHOICES.map((value) => (
              <label
                key={value}
                className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-base transition-colors duration-120 hover:bg-foreground/5 has-checked:bg-accent has-checked:text-accent-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
              >
                <input
                  type="radio"
                  name={`${id}-reason`}
                  value={value}
                  checked={choice === value}
                  onChange={() => {
                    setChoice(value);
                    setError(null);
                  }}
                  disabled={pending}
                  className="size-4 accent-primary outline-none"
                />
                {value}
              </label>
            ))}
          </fieldset>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-note`}>
              Ghi thêm{" "}
              <span className="font-normal text-muted-foreground">
                ({choice === OTHER ? "bắt buộc" : "không bắt buộc"})
              </span>
            </Label>
            <Textarea
              id={`${id}-note`}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setError(null);
              }}
              maxLength={LIMITS.MODERATION_REASON_MAX}
              disabled={pending}
              className="min-h-20"
            />
          </div>

          <FieldError id={`${id}-error`}>{error}</FieldError>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
            <Button type="submit" variant="outline" loading={pending}>
              Ẩn bài
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
