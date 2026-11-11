"use client";

import {
  type Category,
  COMPOSER_MESSAGES,
  composerPrompt,
  createPostSchema,
  FILE_MESSAGES,
  IMAGE_MIME_TYPES,
  LIMITS,
  MEDIA_KINDS,
  MEDIA_MIME_TYPES,
  type MediaItem,
  type MediaKind,
  VIDEO_MIME_TYPES,
} from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
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
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { initials } from "@/lib/initials";

type UploadStatus = "uploading" | "done" | "error";

interface Attachment {
  key: string;
  file: File;
  kind: MediaKind;
  previewUrl: string;
  status: UploadStatus;
  media?: MediaItem;
  error?: string;
  controller: AbortController;
}

type FieldErrors = Partial<Record<"title" | "content" | "category" | "mediaIds", string>>;

const ACCEPT = MEDIA_MIME_TYPES.join(",");

/** Kiểm tra trước ở trình duyệt (backend kiểm tra lại bằng chữ ký nhị phân): loại và cỡ theo loại. */
function checkFile(file: File): { kind: MediaKind } | { error: string } {
  if ((IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return file.size > LIMITS.IMAGE_MAX_BYTES
      ? { error: FILE_MESSAGES.IMAGE_TOO_LARGE }
      : { kind: MEDIA_KINDS.IMAGE };
  }
  if ((VIDEO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return file.size > LIMITS.VIDEO_MAX_BYTES
      ? { error: FILE_MESSAGES.VIDEO_TOO_LARGE }
      : { kind: MEDIA_KINDS.VIDEO };
  }
  return { error: FILE_MESSAGES.UNSUPPORTED };
}

let nextKey = 0;

/**
 * Tạo bài trên trang chủ (docs/tinh-nang.md mục 2.3): tấm `glass` có ảnh đại diện, lời mời viết và nút Ảnh/Video;
 * bấm vào mở hộp soạn. Ảnh, video tải lên ngay khi chọn (mỗi file một ô xem trước có trạng thái), đăng xong thì
 * làm mới feed. Mọi thành viên đăng thẳng (ADR 0008). Đóng hộp khi đang viết dở thì hỏi lại.
 */
export function PostComposer({
  user,
  categories,
}: {
  user: { name: string; image: string | null };
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Gỡ URL xem trước khi rời trang
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(
    () => () => {
      for (const item of attachmentsRef.current) {
        item.controller.abort();
        URL.revokeObjectURL(item.previewUrl);
      }
    },
    [],
  );

  const dirty = title.trim() !== "" || content.trim() !== "" || attachments.length > 0;
  const uploading = attachments.some((item) => item.status === "uploading");

  function reset() {
    for (const item of attachments) {
      item.controller.abort();
      URL.revokeObjectURL(item.previewUrl);
    }
    setTitle("");
    setContent("");
    setAttachments([]);
    setErrors({});
    setFormError(null);
  }

  function onOpenChange(next: boolean) {
    if (next) {
      setOpen(true);
      return;
    }
    if (pending) return;
    if (dirty && !window.confirm(COMPOSER_MESSAGES.DISCARD_CONFIRM)) return;
    reset();
    setOpen(false);
  }

  function updateAttachment(key: string, patch: Partial<Attachment>) {
    setAttachments((items) =>
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  async function upload(item: Attachment) {
    try {
      const { data } = await browserApi.files.upload(
        item.file,
        item.file.name,
        item.controller.signal,
      );
      updateAttachment(item.key, { status: "done", media: data });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      updateAttachment(item.key, {
        status: "error",
        error: isApiError(error) ? error.message : FILE_MESSAGES.UPLOAD_FAILED,
      });
    }
  }

  function onFilesChosen(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    setOpen(true);

    const room = LIMITS.POST_MEDIA_MAX - attachments.length;
    setErrors((current) => ({
      ...current,
      mediaIds: files.length > room ? COMPOSER_MESSAGES.TOO_MANY : undefined,
    }));

    const added: Attachment[] = files.slice(0, Math.max(room, 0)).map((file) => {
      const check = checkFile(file);
      return {
        key: `m${nextKey++}`,
        file,
        kind: "kind" in check ? check.kind : MEDIA_KINDS.IMAGE,
        previewUrl: URL.createObjectURL(file),
        status: "error" in check ? "error" : "uploading",
        error: "error" in check ? check.error : undefined,
        controller: new AbortController(),
      };
    });
    setAttachments((items) => [...items, ...added]);
    for (const item of added) if (item.status === "uploading") void upload(item);
  }

  function removeAttachment(key: string) {
    const item = attachments.find((candidate) => candidate.key === key);
    if (!item) return;
    item.controller.abort();
    URL.revokeObjectURL(item.previewUrl);
    setAttachments((items) => items.filter((candidate) => candidate.key !== key));
    setErrors((current) => ({ ...current, mediaIds: undefined }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (uploading) {
      setFormError(COMPOSER_MESSAGES.WAIT_UPLOAD);
      return;
    }
    if (attachments.some((item) => item.status === "error")) {
      setErrors((current) => ({ ...current, mediaIds: FILE_MESSAGES.NOT_ATTACHABLE }));
      return;
    }

    const parsed = createPostSchema.safeParse({
      title,
      content,
      category,
      mediaIds: attachments.flatMap((item) => (item.media ? [item.media.id] : [])),
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await browserApi.posts.create(parsed.data);
      for (const item of attachments) URL.revokeObjectURL(item.previewUrl);
      setTitle("");
      setContent("");
      setAttachments([]);
      setOpen(false);
      setAnnouncement(COMPOSER_MESSAGES.PUBLISHED);
      router.refresh();
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message);
        if (error.fields) setErrors(error.fields as FieldErrors);
      } else {
        setFormError(FILE_MESSAGES.UPLOAD_FAILED);
      }
    } finally {
      setPending(false);
    }
  }

  // Thông báo đăng xong tự ẩn sau vài giây
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => setAnnouncement(""), 5000);
    return () => clearTimeout(timer);
  }, [announcement]);

  const avatar = (
    <Avatar className="size-10 shrink-0">
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );

  return (
    <section
      aria-label={COMPOSER_MESSAGES.DIALOG_TITLE}
      className="glass animate-rise-in rounded-xl p-4 sm:p-5"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={onFilesChosen}
      />

      <div className="flex items-center gap-3">
        {avatar}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 min-w-0 flex-1 cursor-pointer items-center rounded-full border border-input/60 px-4 text-left text-base text-muted-foreground transition-colors duration-200 hover:border-input hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="truncate">{composerPrompt(user.name)}</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-glass-border-hover/40 pt-3">
        <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus aria-hidden="true" />
          {COMPOSER_MESSAGES.ADD_MEDIA}
        </Button>
        <output aria-live="polite" className="text-sm font-medium text-foreground">
          {announcement}
        </output>
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-xl"
          // Mở hộp thì con trỏ vào ô nội dung (Radix mặc định vào ô đầu tiên là tiêu đề)
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>{COMPOSER_MESSAGES.DIALOG_TITLE}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {avatar}
              <span className="font-medium text-foreground">{user.name}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormAlert message={formError} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="composer-title" className="sr-only">
                {COMPOSER_MESSAGES.TITLE_PLACEHOLDER}
              </Label>
              <Input
                id="composer-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={COMPOSER_MESSAGES.TITLE_PLACEHOLDER}
                maxLength={LIMITS.POST_TITLE_MAX}
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "composer-title-error" : undefined}
                disabled={pending}
              />
              <FieldError id="composer-title-error">{errors.title}</FieldError>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="composer-content" className="sr-only">
                {COMPOSER_MESSAGES.CONTENT_LABEL}
              </Label>
              <Textarea
                id="composer-content"
                ref={contentRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={COMPOSER_MESSAGES.CONTENT_PLACEHOLDER}
                maxLength={LIMITS.POST_PLAIN_CONTENT_MAX}
                aria-invalid={errors.content ? true : undefined}
                aria-describedby={errors.content ? "composer-content-error" : undefined}
                disabled={pending}
                className="max-h-[40dvh] min-h-32 text-lg"
              />
              <FieldError id="composer-content-error">{errors.content}</FieldError>
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
                          className="size-full object-cover"
                        />
                        <Play
                          aria-hidden="true"
                          className="absolute bottom-1.5 left-1.5 size-4 text-white drop-shadow"
                          fill="currentColor"
                        />
                      </>
                    ) : (
                      // oxlint-disable-next-line nextjs/no-img-element -- ảnh xem trước từ blob: URL, không qua next/image
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
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
                      onClick={() => removeAttachment(item.key)}
                      disabled={pending}
                      aria-label={`${COMPOSER_MESSAGES.REMOVE_MEDIA}: ${item.file.name}`}
                      className="absolute top-1 right-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <FieldError id="composer-media-error">{errors.mediaIds}</FieldError>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => fileInputRef.current?.click()}
                disabled={pending || attachments.length >= LIMITS.POST_MEDIA_MAX}
              >
                <ImagePlus aria-hidden="true" />
                {COMPOSER_MESSAGES.ADD_MEDIA}
              </Button>
              <p className="text-sm text-muted-foreground">{COMPOSER_MESSAGES.MEDIA_HINT}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="composer-category">{COMPOSER_MESSAGES.CATEGORY_LABEL}</Label>
              <select
                id="composer-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={errors.category ? "composer-category-error" : undefined}
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
              <FieldError id="composer-category-error">{errors.category}</FieldError>
            </div>

            <Button type="submit" className="w-full sm:w-auto sm:self-end" loading={pending}>
              {COMPOSER_MESSAGES.SUBMIT}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
