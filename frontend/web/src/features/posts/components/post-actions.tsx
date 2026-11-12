"use client";

import {
  type Category,
  ERROR_MESSAGES,
  POST_MESSAGES,
  type PostDetail,
  updatePostSchema,
} from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { Button } from "@xom-nho/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@xom-nho/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { cn } from "@xom-nho/ui/lib/utils";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { usePostEditor } from "../hooks/use-post-editor";
import { postChanges } from "../lib/post-changes";
import { PostEditorDialog } from "./post-editor-dialog";

const EMPTY = { title: "", content: "", category: "", mediaIds: [] };

/**
 * Menu "…" trên bài của chính mình (docs/tinh-nang.md mục 2.3): Sửa bài mở hộp soạn ở chế độ sửa, Xóa bài hỏi lại
 * rồi xóa hẳn (cả bình luận, ảnh, video). Chỉ hiện cho tác giả; quyền thật do backend quyết (403 với người khác).
 * - Trên thẻ trong feed chưa có nội dung bài: bấm Sửa thì tải bài (`GET /posts/:slug`) rồi mới hiện form.
 * - Trên trang bài thì truyền sẵn `detail`; xóa xong chuyển sang `afterDelete` vì trang bài không còn.
 */
export function PostActions({
  post,
  author,
  categories,
  detail,
  afterDelete,
  className,
}: {
  post: { id: string; slug: string };
  author: { name: string; image: string | null };
  categories: Category[];
  detail?: PostDetail;
  afterDelete?: string;
  className?: string;
}) {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editor = usePostEditor({
    defaults: EMPTY,
    discardMessage: POST_MESSAGES.DISCARD_EDIT_CONFIRM,
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadRef = useRef<AbortController | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Đóng hộp sửa khi bài đang tải thì thôi không tải nữa
  useEffect(() => {
    if (!editor.open) loadRef.current?.abort();
  }, [editor.open]);
  useEffect(() => () => loadRef.current?.abort(), []);

  // Báo "Đã lưu thay đổi." vài giây rồi ẩn
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => setAnnouncement(""), 5000);
    return () => clearTimeout(timer);
  }, [announcement]);

  async function startEdit() {
    setLoadError(null);
    editor.setOpen(true);
    if (detail) {
      setLoading(false);
      editor.load(detail);
      return;
    }

    const controller = new AbortController();
    loadRef.current = controller;
    setLoading(true);
    try {
      const { data } = await browserApi.posts.get(post.slug, controller.signal);
      editor.load(data);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setLoadError(POST_MESSAGES.LOAD_FAILED);
    } finally {
      if (loadRef.current === controller) setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const done = await editor.submit(
      (values) => updatePostSchema.safeParse(postChanges(editor.baseline, values)),
      (data) => browserApi.posts.update(post.id, data),
    );
    if (!done) return;
    editor.finish();
    setAnnouncement(POST_MESSAGES.SAVED);
    router.refresh();
  }

  async function remove() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await browserApi.posts.remove(post.id);
      setConfirmOpen(false);
      if (afterDelete) router.replace(afterDelete);
      else router.refresh();
    } catch (error) {
      setDeleteError(isApiError(error) ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    } finally {
      setDeleting(false);
    }
  }

  // Hộp mở từ menu: đóng hộp thì focus về nút "…" (mục menu đã biến mất)
  function focusTrigger(event: Event) {
    event.preventDefault();
    triggerRef.current?.focus();
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <output aria-live="polite" className="text-sm font-medium text-foreground">
        {announcement}
      </output>

      {/* Không khóa cuộn trang khi mở menu (MASTER "Menu thả xuống"), và tránh lỗi Radix kẹt `pointer-events`
          khi mở hộp thoại từ mục menu */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            size="icon"
            // Điện thoại: vùng bấm 44px (MASTER mục 10)
            className="max-sm:size-11"
            aria-label={POST_MESSAGES.ACTIONS}
          >
            <Ellipsis aria-hidden="true" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => void startEdit()}>
            <Pencil aria-hidden="true" />
            {POST_MESSAGES.EDIT}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              setDeleteError(null);
              setConfirmOpen(true);
            }}
          >
            <Trash2 aria-hidden="true" />
            {POST_MESSAGES.DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PostEditorDialog
        editor={editor}
        mode="edit"
        author={author}
        categories={categories}
        onSubmit={onSubmit}
        loading={loading}
        loadError={loadError}
        onCloseAutoFocus={focusTrigger}
      />

      <Dialog open={confirmOpen} onOpenChange={(open) => !deleting && setConfirmOpen(open)}>
        <DialogContent className="sm:max-w-md" onCloseAutoFocus={focusTrigger}>
          <DialogHeader>
            <DialogTitle>{POST_MESSAGES.DELETE_TITLE}</DialogTitle>
            <DialogDescription>{POST_MESSAGES.DELETE_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <FormAlert message={deleteError} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirmOpen(false)}
            >
              {POST_MESSAGES.DELETE_CANCEL}
            </Button>
            <Button type="button" variant="destructive" loading={deleting} onClick={remove}>
              {POST_MESSAGES.DELETE_CONFIRM}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
