"use client";

import {
  COMPOSER_MESSAGES,
  ERROR_MESSAGES,
  FILE_MESSAGES,
  IMAGE_MIME_TYPES,
  LIMITS,
  MEDIA_KINDS,
  type MediaItem,
  type MediaKind,
  type PostDetail,
  VIDEO_MIME_TYPES,
} from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { mediaUrl } from "@/lib/media-url";
import {
  hasChanges,
  postChanges,
  postEditorValues,
  type PostEditorValues,
} from "../lib/post-changes";

type UploadStatus = "uploading" | "done" | "error";

/** Một ô ảnh/video trong hộp soạn: file vừa chọn (đang tải, xong, lỗi) hoặc file đã có trong bài đang sửa. */
export interface Attachment {
  key: string;
  kind: MediaKind;
  /** Tên cho trình đọc màn hình và nút gỡ: tên file, hoặc "Ảnh 2" với file đã có trong bài */
  name: string;
  /** `blob:` với file vừa chọn (phải gỡ khi xong), đường dẫn backend với file đã có trong bài */
  previewUrl: string;
  status: UploadStatus;
  media?: MediaItem;
  error?: string;
  /** Chỉ file vừa chọn mới có `file` và `controller` */
  file?: File;
  controller?: AbortController;
}

export type PostField = "title" | "content" | "category" | "mediaIds";
export type PostFieldErrors = Partial<Record<PostField, string>>;

const POST_FIELDS: readonly string[] = ["title", "content", "category", "mediaIds"];

/** Kết quả `safeParse` của Zod, viết theo cấu trúc để web không phải phụ thuộc thẳng vào `zod`. */
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };

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

/** Dừng tải lên và gỡ URL xem trước (chỉ `blob:` mới cần gỡ). */
function release(item: Attachment) {
  item.controller?.abort();
  if (item.file) URL.revokeObjectURL(item.previewUrl);
}

function existingAttachment(media: MediaItem, index: number): Attachment {
  return {
    key: `e-${media.id}`,
    kind: media.kind,
    name: `${media.kind === MEDIA_KINDS.VIDEO ? "Video" : "Ảnh"} ${index + 1}`,
    previewUrl: mediaUrl(media.id),
    status: "done",
    media,
  };
}

let nextKey = 0;

/**
 * Trạng thái của hộp soạn bài (docs/tinh-nang.md mục 2.3), dùng chung cho đăng bài và sửa bài:
 * ô chữ, danh mục, ảnh/video tải lên ngay khi chọn, lỗi từng ô, đóng hộp khi đang dở thì hỏi lại.
 * - Đăng bài: bắt đầu từ `defaults`.
 * - Sửa bài: gọi `load(post)`; "đang dở" là đã khác bài lúc mở (`changes`).
 * Đóng hộp thì về `defaults`, file đang tải dừng lại.
 */
export function usePostEditor({
  defaults,
  discardMessage,
}: {
  defaults: PostEditorValues;
  /** Câu hỏi lại khi đóng hộp lúc đang dở */
  discardMessage: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [baseline, setBaseline] = useState(defaults);
  const [title, setTitle] = useState(defaults.title);
  const [content, setContent] = useState(defaults.content);
  const [category, setCategory] = useState(defaults.category);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<PostFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Rời trang khi đang tải: dừng tải và gỡ URL xem trước
  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(
    () => () => {
      for (const item of attachmentsRef.current) release(item);
    },
    [],
  );

  const values: PostEditorValues = {
    title,
    content,
    category,
    mediaIds: attachments.flatMap((item) => (item.media ? [item.media.id] : [])),
  };
  const changes = postChanges(baseline, values);
  const uploading = attachments.some((item) => item.status === "uploading");
  const dirty = hasChanges(changes) || attachments.some((item) => item.status !== "done");

  function fill(next: PostEditorValues, nextAttachments: Attachment[]) {
    for (const item of attachments) release(item);
    setBaseline(next);
    setTitle(next.title);
    setContent(next.content);
    setCategory(next.category);
    setAttachments(nextAttachments);
    setErrors({});
    setFormError(null);
  }

  /** Đổ bài cần sửa vào hộp: ảnh, video đã có hiện như ô đã tải xong. */
  function load(post: PostDetail) {
    fill(postEditorValues(post), post.media.map(existingAttachment));
  }

  /** Đóng hộp không hỏi lại (đăng, lưu xong) và về trạng thái ban đầu. */
  function finish() {
    fill(defaults, []);
    setOpen(false);
  }

  function onOpenChange(next: boolean) {
    if (next) {
      setOpen(true);
      return;
    }
    if (pending) return;
    if (dirty && !window.confirm(discardMessage)) return;
    finish();
  }

  function updateAttachment(key: string, patch: Partial<Attachment>) {
    setAttachments((items) =>
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  async function upload(item: Attachment & { file: File; controller: AbortController }) {
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

  function pickFiles() {
    fileInputRef.current?.click();
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

    const added = files.slice(0, Math.max(room, 0)).map((file) => {
      const check = checkFile(file);
      return {
        key: `m${nextKey++}`,
        kind: "kind" in check ? check.kind : MEDIA_KINDS.IMAGE,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        status: "error" in check ? ("error" as const) : ("uploading" as const),
        error: "error" in check ? check.error : undefined,
        file,
        controller: new AbortController(),
      };
    });
    setAttachments((items) => [...items, ...added]);
    for (const item of added) if (item.status === "uploading") void upload(item);
  }

  function removeAttachment(key: string) {
    const item = attachments.find((candidate) => candidate.key === key);
    if (!item) return;
    release(item);
    setAttachments((items) => items.filter((candidate) => candidate.key !== key));
    setErrors((current) => ({ ...current, mediaIds: undefined }));
  }

  /**
   * Gửi bài: chờ file tải xong, kiểm tra bằng `parse` (schema Zod của `api`), rồi `send`.
   * Lỗi theo ô hiện dưới ô; lỗi chung (như "Bạn chưa thay đổi gì") hiện ở đầu hộp. Trả `true` nếu gửi xong.
   */
  async function submit<T>(
    parse: (values: PostEditorValues) => ParseResult<T>,
    send: (data: T) => Promise<unknown>,
  ): Promise<boolean> {
    setFormError(null);
    if (uploading) {
      setFormError(COMPOSER_MESSAGES.WAIT_UPLOAD);
      return false;
    }
    if (attachments.some((item) => item.status === "error")) {
      setErrors((current) => ({ ...current, mediaIds: FILE_MESSAGES.NOT_ATTACHABLE }));
      return false;
    }

    const parsed = parse(values);
    if (!parsed.success) {
      const next: PostFieldErrors = {};
      let general: string | null = null;
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && POST_FIELDS.includes(field)) {
          next[field as PostField] ??= issue.message;
        } else {
          general ??= issue.message;
        }
      }
      setErrors(next);
      setFormError(general);
      return false;
    }

    setErrors({});
    setPending(true);
    try {
      await send(parsed.data);
      return true;
    } catch (error) {
      if (isApiError(error)) {
        setFormError(error.message);
        if (error.fields) setErrors(error.fields as PostFieldErrors);
      } else {
        setFormError(ERROR_MESSAGES.INTERNAL_ERROR);
      }
      return false;
    } finally {
      setPending(false);
    }
  }

  return {
    fileInputRef,
    open,
    setOpen,
    onOpenChange,
    title,
    setTitle,
    content,
    setContent,
    category,
    setCategory,
    attachments,
    errors,
    formError,
    pending,
    baseline,
    changes,
    load,
    finish,
    pickFiles,
    onFilesChosen,
    removeAttachment,
    submit,
  };
}

export type PostEditor = ReturnType<typeof usePostEditor>;
