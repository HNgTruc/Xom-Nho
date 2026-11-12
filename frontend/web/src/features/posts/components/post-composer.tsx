"use client";

import { type Category, COMPOSER_MESSAGES, composerPrompt, createPostSchema } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Button } from "@xom-nho/ui/components/button";
import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { initials } from "@/lib/initials";
import { usePostEditor } from "../hooks/use-post-editor";
import { PostEditorDialog } from "./post-editor-dialog";

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
  const editor = usePostEditor({
    defaults: { title: "", content: "", category: categories[0]?.slug ?? "", mediaIds: [] },
    discardMessage: COMPOSER_MESSAGES.DISCARD_CONFIRM,
  });
  const [announcement, setAnnouncement] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const done = await editor.submit(
      (values) => createPostSchema.safeParse(values),
      (data) => browserApi.posts.create(data),
    );
    if (!done) return;
    editor.finish();
    setAnnouncement(COMPOSER_MESSAGES.PUBLISHED);
    router.refresh();
  }

  // Thông báo đăng xong tự ẩn sau vài giây
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => setAnnouncement(""), 5000);
    return () => clearTimeout(timer);
  }, [announcement]);

  return (
    <section
      aria-label={COMPOSER_MESSAGES.DIALOG_TITLE}
      className="glass animate-rise-in rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10 shrink-0">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => editor.setOpen(true)}
          className="flex h-11 min-w-0 flex-1 cursor-pointer items-center rounded-full border border-input/60 px-4 text-left text-base text-muted-foreground transition-colors duration-200 hover:border-input hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="truncate">{composerPrompt(user.name)}</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-glass-border-hover/40 pt-3">
        <Button type="button" variant="ghost" onClick={editor.pickFiles}>
          <ImagePlus aria-hidden="true" />
          {COMPOSER_MESSAGES.ADD_MEDIA}
        </Button>
        <output aria-live="polite" className="text-sm font-medium text-foreground">
          {announcement}
        </output>
      </div>

      <PostEditorDialog
        editor={editor}
        mode="create"
        author={user}
        categories={categories}
        onSubmit={onSubmit}
      />
    </section>
  );
}
