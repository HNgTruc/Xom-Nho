"use client";

import {
  type Category,
  COMPOSER_MESSAGES,
  LIMITS,
  MEDIA_KINDS,
  MEDIA_MIME_TYPES,
  POST_MESSAGES,
} from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Button } from "@xom-nho/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@xom-nho/ui/components/dialog";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { Input } from "@xom-nho/ui/components/input";
import { Label } from "@xom-nho/ui/components/label";
import { Textarea } from "@xom-nho/ui/components/textarea";
import { cn } from "@xom-nho/ui/lib/utils";
import { AlertCircle, ImagePlus, Loader2, Play, X } from "lucide-react";
import { type FormEvent, useEffect, useId, useRef } from "react";
import { initials } from "@/lib/initials";
import type { PostEditor } from "../hooks/use-post-editor";

const ACCEPT = MEDIA_MIME_TYPES.join(",");

/**
 * Hộp soạn bài (MASTER mục 7, "Tấm tạo bài và hộp soạn"), dùng cho cả đăng bài lẫn sửa bài. Trạng thái nằm
 * trong `usePostEditor`; ô chọn file nằm ngoài `Dialog` để nút Ảnh/Video bên ngoài hộp cũng mở được.
 * Sửa bài từ thẻ trong feed phải tải bài trước: `loading` hiện vòng quay, `loadError` hiện lỗi thay cho form.
 */
export function PostEditorDialog({
  editor,
  mode,
  author,
  categories,
  onSubmit,
  loading = false,
  loadError = null,
  onCloseAutoFocus,
}: {
  editor: PostEditor;
  mode: "create" | "edit";
  author: { name: string; image: string | null };
  categories: Category[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  loadError?: string | null;
  /** Hộp mở từ menu thì trả focus về nút mở menu (mục menu đã biến mất) */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const id = useId();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { attachments, errors, pending, fileInputRef } = editor;
  const ready = !loading && !loadError;

  // Sửa bài từ thẻ: bài tải xong thì con trỏ vào ô nội dung
  useEffect(() => {
    if (editor.open && ready) contentRef.current?.focus();
  }, [editor.open, ready]);

  const avatar = (
    <Avatar className="size-10 shrink-0">
      {author.image && <AvatarImage src={author.image} alt="" />}
      <AvatarFallback>{initials(author.name)}</AvatarFallback>
    </Avatar>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={editor.onFilesChosen}
      />

      <Dialog open={editor.open} onOpenChange={editor.onOpenChange}>
        <DialogContent
          className="sm:max-w-xl"
          // Mở hộp thì con trỏ vào ô nội dung (Radix mặc định vào ô đầu tiên là tiêu đề)
          onOpenAutoFocus={(event) => {
            if (!contentRef.current) return;
            event.preventDefault();
            contentRef.current.focus();
          }}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? POST_MESSAGES.EDIT_TITLE : COMPOSER_MESSAGES.DIALOG_TITLE}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {avatar}
              <span className="font-medium text-foreground">{author.name}</span>
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <output className="flex min-h-48 items-center justify-center gap-2 text-base text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              {POST_MESSAGES.LOADING}
            </output>
          ) : loadError ? (
            <FormAlert message={loadError} />
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <FormAlert message={editor.formError} />

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-title`} className="sr-only">
                  {COMPOSER_MESSAGES.TITLE_PLACEHOLDER}
                </Label>
                <Input
                  id={`${id}-title`}
                  value={editor.title}
                  onChange={(event) => editor.setTitle(event.target.value)}
                  placeholder={COMPOSER_MESSAGES.TITLE_PLACEHOLDER}
                  maxLength={LIMITS.POST_TITLE_MAX}
                  aria-invalid={errors.title ? true : undefined}
                  aria-describedby={errors.title ? `${id}-title-error` : undefined}
                  disabled={pending}
                />
                <FieldError id={`${id}-title-error`}>{errors.title}</FieldError>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-content`} className="sr-only">
                  {COMPOSER_MESSAGES.CONTENT_LABEL}
                </Label>
                <Textarea
                  id={`${id}-content`}
                  ref={contentRef}
                  value={editor.content}
                  onChange={(event) => editor.setContent(event.target.value)}
                  placeholder={COMPOSER_MESSAGES.CONTENT_PLACEHOLDER}
                  maxLength={LIMITS.POST_PLAIN_CONTENT_MAX}
                  aria-invalid={errors.content ? true : undefined}
                  aria-describedby={errors.content ? `${id}-content-error` : undefined}
                  disabled={pending}
                  className="max-h-[40dvh] min-h-32 text-lg"
                />
                <FieldError id={`${id}-content-error`}>{errors.content}</FieldError>
              </div>

              {attachments.length > 0 && (
                <ul
                  aria-label="Ảnh và video đã chọn"
                  className="grid grid-cols-3 gap-2 sm:grid-cols-4"
                >
                  {attachments.map((item) => (
                    <li
                      key={item.key}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md bg-muted",
                        item.status === "error" && "ring-2 ring-destructive",
                      )}
                    >
                      {item.kind === MEDIA_KINDS.VIDEO ? (
                        <>
                          <video
                            src={item.previewUrl}
                            muted
                            playsInline
                            preload="metadata"
                            aria-label={item.name}
                            className="size-full object-cover"
                          />
                          <Play
                            aria-hidden="true"
                            className="absolute bottom-1.5 left-1.5 size-4 text-white drop-shadow"
                            fill="currentColor"
                          />
                        </>
                      ) : (
                        // oxlint-disable-next-line nextjs/no-img-element -- ảnh xem trước từ blob: hoặc backend (cần cookie), không qua next/image
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      )}

                      {item.status === "uploading" && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                          <Loader2 aria-hidden="true" className="size-6 animate-spin" />
                          <span className="sr-only">{COMPOSER_MESSAGES.UPLOADING}</span>
                        </span>
                      )}
                      {item.status === "error" && (
                        <span
                          title={item.error}
                          className="absolute inset-x-0 bottom-0 flex items-start gap-1 bg-destructive/90 p-1.5 text-xs leading-snug font-medium text-white"
                        >
                          <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                          <span className="line-clamp-3">{item.error}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => editor.removeAttachment(item.key)}
                        disabled={pending}
                        aria-label={`${COMPOSER_MESSAGES.REMOVE_MEDIA}: ${item.name}`}
                        className="absolute top-1 right-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <FieldError id={`${id}-media-error`}>{errors.mediaIds}</FieldError>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  onClick={editor.pickFiles}
                  disabled={pending || attachments.length >= LIMITS.POST_MEDIA_MAX}
                >
                  <ImagePlus aria-hidden="true" />
                  {COMPOSER_MESSAGES.ADD_MEDIA}
                </Button>
                <p className="text-sm text-muted-foreground">{COMPOSER_MESSAGES.MEDIA_HINT}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-category`}>{COMPOSER_MESSAGES.CATEGORY_LABEL}</Label>
                <select
                  id={`${id}-category`}
                  value={editor.category}
                  onChange={(event) => editor.setCategory(event.target.value)}
                  aria-invalid={errors.category ? true : undefined}
                  aria-describedby={errors.category ? `${id}-category-error` : undefined}
                  disabled={pending}
                  className="h-11 w-full cursor-pointer rounded-sm border border-input bg-card px-3 text-base text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none aria-invalid:border-destructive sm:h-10"
                >
                  <option value="" disabled>
                    {COMPOSER_MESSAGES.CATEGORY_PLACEHOLDER}
                  </option>
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <FieldError id={`${id}-category-error`}>{errors.category}</FieldError>
              </div>

              <Button type="submit" className="w-full sm:w-auto sm:self-end" loading={pending}>
                {mode === "edit" ? POST_MESSAGES.SAVE : COMPOSER_MESSAGES.SUBMIT}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
