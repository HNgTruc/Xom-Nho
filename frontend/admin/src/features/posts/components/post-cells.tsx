import type { AdminPostListItem, UserSummary } from "@xom-nho/api";
import { avatarUrl } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Images } from "lucide-react";
import { API_URL, WEB_URL } from "@/lib/env";

/**
 * Tên bài trong bảng (pages/admin.md "Bảng Bài viết"): bài có tiêu đề in đậm 600; bài không tiêu đề (ADR 0008) hiện
 * phần đầu nội dung, chữ thường 400. Bấm mở trang bài trên Xóm Nhỏ ở thẻ mới (trưởng xóm mở được cả bài đang ẩn).
 */
export function PostTitleCell({ post }: { post: AdminPostListItem }) {
  const text = post.title || post.excerpt || "Bài chỉ có ảnh, video";
  return (
    <div className="flex max-w-md min-w-0 items-start gap-2 md:min-w-48">
      <a
        href={`${WEB_URL}/bai-viet/${post.slug}`}
        target="_blank"
        rel="noopener"
        className={`line-clamp-2 rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${post.title ? "font-semibold" : "font-normal"}`}
      >
        {text}
        <span className="sr-only"> (mở trên Xóm Nhỏ, thẻ mới)</span>
      </a>
      {post.mediaCount > 0 && (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Images aria-hidden="true" className="size-3.5" />
          {post.mediaCount}
          <span className="sr-only"> ảnh, video</span>
        </span>
      )}
    </div>
  );
}

function initial(name: string): string {
  return (name.trim().split(/\s+/).at(-1)?.[0] ?? "?").toUpperCase();
}

/** Tác giả: avatar 24px nền `muted` (avatar người khác, pages/admin.md) và tên. */
export function AuthorCell({ author }: { author: UserSummary }) {
  const src = avatarUrl(API_URL, author);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Avatar className="size-6">
        {src && <AvatarImage src={src} alt="" />}
        <AvatarFallback className="bg-muted text-xs text-foreground">
          {initial(author.name)}
        </AvatarFallback>
      </Avatar>
      {author.name}
    </span>
  );
}
