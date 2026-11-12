"use client";

import {
  ERROR_MESSAGES,
  FILE_MESSAGES,
  IMAGE_MIME_TYPES,
  LIMITS,
  SETTINGS_MESSAGES,
} from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Button } from "@xom-nho/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@xom-nho/ui/components/dialog";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { initials } from "@/lib/initials";
import { userAvatarSrc } from "@/lib/media-url";

const ACCEPT = IMAGE_MIME_TYPES.join(",");

/** Kiểm tra trước ở trình duyệt (backend kiểm tra lại bằng chữ ký nhị phân). */
function checkAvatar(file: File): string | null {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return FILE_MESSAGES.AVATAR_NOT_IMAGE;
  }
  if (file.size > LIMITS.IMAGE_MAX_BYTES) return FILE_MESSAGES.IMAGE_TOO_LARGE;
  return null;
}

function errorText(error: unknown): string {
  return isApiError(error) ? error.message : ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * Đổi, xóa ảnh đại diện ở `/cai-dat` (docs/tinh-nang.md mục 1.4). Chọn ảnh là tải lên ngay (`PUT /me/avatar`),
 * backend xóa ảnh cũ. Xóa ảnh hỏi lại trước vì file bị xóa hẳn. Xong thì làm mới trang để header cập nhật.
 */
export function AvatarSettings({ name, initialSrc }: { name: string; initialSrc: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState(initialSrc);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function onFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Cho chọn lại đúng file đó lần nữa (sau khi báo lỗi chẳng hạn)
    event.target.value = "";
    if (!file) return;

    const problem = checkAvatar(file);
    if (problem) {
      setMessage({ tone: "error", text: problem });
      return;
    }

    setPending("upload");
    setMessage(null);
    try {
      const { data } = await browserApi.me.uploadAvatar(file, file.name);
      setSrc(userAvatarSrc(data));
      setMessage({ tone: "success", text: SETTINGS_MESSAGES.AVATAR_SAVED });
      router.refresh();
    } catch (error) {
      setMessage({ tone: "error", text: errorText(error) });
    } finally {
      setPending(null);
    }
  }

  async function onRemove() {
    setPending("remove");
    setMessage(null);
    try {
      await browserApi.me.update({ image: null });
      setSrc(null);
      setConfirmOpen(false);
      setMessage({ tone: "success", text: SETTINGS_MESSAGES.AVATAR_REMOVED });
      router.refresh();
    } catch (error) {
      setConfirmOpen(false);
      setMessage({ tone: "error", text: errorText(error) });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {message?.tone === "error" && <FormAlert message={message.text} />}
      {message?.tone === "success" && (
        <output className="block rounded-md bg-accent px-4 py-3 text-base text-accent-foreground">
          {message.text}
        </output>
      )}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Avatar className="size-24 text-2xl font-semibold">
          {/* key: đổi ảnh thì Radix tải ảnh mới, không giữ trạng thái lỗi của ảnh cũ */}
          <AvatarImage key={src ?? "none"} src={src ?? undefined} alt="" />
          <AvatarFallback className="text-3xl">{initials(name)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-3">
          <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={onFileChosen} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              loading={pending === "upload"}
              disabled={pending !== null}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" />
              {src ? "Đổi ảnh" : "Tải ảnh lên"}
            </Button>
            {src && (
              <Button
                type="button"
                variant="ghost"
                disabled={pending !== null}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 aria-hidden="true" />
                Xóa ảnh
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.AVATAR_HINT}</p>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => pending !== "remove" && setConfirmOpen(open)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{SETTINGS_MESSAGES.AVATAR_REMOVE_TITLE}</DialogTitle>
            <DialogDescription>{SETTINGS_MESSAGES.AVATAR_REMOVE_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending === "remove"}
              onClick={() => setConfirmOpen(false)}
            >
              Giữ lại
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={pending === "remove"}
              onClick={onRemove}
            >
              Xóa ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
