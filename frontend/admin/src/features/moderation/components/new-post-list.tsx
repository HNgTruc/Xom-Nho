import { type AdminPostListItem, formatRelativeTime } from "@xom-nho/api";
import { Badge } from "@xom-nho/ui/components/badge";
import { cn } from "@xom-nho/ui/lib/utils";
import { Check, Images } from "lucide-react";
import { PostStatusBadge } from "@/components/common/status-badge";
import { useNow } from "@/hooks/use-now";

/**
 * Danh sách bài mới bên trái (360px, pages/admin.md "Bài mới"): mỗi bài một nút. Bài đang xem nền `accent` 28% và
 * `aria-current`; bài đã mở mờ 72% kèm nhãn "Đã xem" (không biến mất, quay lại được); bài đã ẩn có nhãn "Đã ẩn".
 */
export function NewPostList({
  posts,
  selectedId,
  seen,
  onSelect,
}: {
  posts: AdminPostListItem[];
  selectedId: string | undefined;
  seen: ReadonlySet<string>;
  onSelect: (index: number) => void;
}) {
  const now = useNow();
  return (
    <ul className="flex flex-col gap-1">
      {posts.map((post, index) => {
        const selected = post.id === selectedId;
        const hidden = post.status === "ARCHIVED";
        const wasSeen = seen.has(post.id) && !selected;
        return (
          <li key={post.id}>
            <button
              type="button"
              aria-current={selected ? "true" : undefined}
              onClick={() => onSelect(index)}
              className={cn(
                "flex w-full cursor-pointer flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors duration-120 outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring",
                selected && "bg-accent/28 hover:bg-accent/28",
                wasSeen && "opacity-72",
              )}
            >
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate font-medium text-foreground">{post.author.name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.createdAt} className="shrink-0">
                  {formatRelativeTime(post.createdAt, now)}
                </time>
                {hidden ? (
                  <PostStatusBadge status="ARCHIVED" className="ml-auto" />
                ) : wasSeen ? (
                  <Badge
                    variant="ghost"
                    className="ml-auto h-5 bg-muted px-1.5 text-xs text-foreground [&>svg]:size-3.5!"
                  >
                    <Check aria-hidden="true" strokeWidth={1.75} />
                    Đã xem
                  </Badge>
                ) : null}
              </span>
              <span
                className={cn("line-clamp-2 text-sm", post.title ? "font-semibold" : "font-normal")}
              >
                {post.title || post.excerpt || "Bài chỉ có ảnh, video"}
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {post.category.name}
                {post.mediaCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Images aria-hidden="true" className="size-3.5" />
                    {post.mediaCount}
                    <span className="sr-only"> ảnh, video</span>
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
