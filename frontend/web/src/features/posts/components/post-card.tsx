import { formatDate, formatRelativeTime, type PostListItem } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { initials } from "../lib/initials";
import { CategoryBadge } from "./category-badge";

/**
 * Thẻ bài trong feed (MASTER mục 7): badge danh mục, tiêu đề, tóm tắt 2 dòng, rồi tác giả, thời gian, số bình luận.
 * Cả thẻ bấm được nhờ liên kết tiêu đề phủ kín thẻ (`after:inset-0`); badge danh mục, tag nằm trên lớp đó
 * (`relative z-10`) nên vẫn bấm riêng được, không lồng thẻ `<a>` trong nhau.
 * Hover đổi cả viền: chế độ tối nền muted trùng nền card, chỉ đổi nền thì không thấy gì.
 */
export function PostCard({ post, now }: { post: PostListItem; now: Date }) {
  return (
    <article className="relative flex flex-col gap-3 rounded-md border border-border bg-card p-4 transition-colors duration-[120ms] hover:border-input hover:bg-muted has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-ring has-[[data-card-link]:focus-visible]:ring-offset-2 has-[[data-card-link]:focus-visible]:ring-offset-background sm:p-5">
      <CategoryBadge category={post.category} className="relative z-10" />

      <h2 className="text-lg font-semibold text-card-foreground">
        <Link
          href={`/bai-viet/${post.slug}`}
          data-card-link
          className="after:absolute after:inset-0 after:rounded-md focus-visible:outline-none"
        >
          {post.title}
        </Link>
      </h2>

      {post.excerpt && (
        <p className="line-clamp-2 text-base text-muted-foreground">{post.excerpt}</p>
      )}

      {post.tags.length > 0 && (
        <ul aria-label="Thẻ" className="relative z-10 flex w-fit flex-wrap gap-x-3 gap-y-1">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                href={`/tag/${tag.slug}`}
                className="rounded-sm text-sm text-muted-foreground hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Avatar size="sm">
          {post.author.image && <AvatarImage src={post.author.image} alt="" />}
          <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-card-foreground">{post.author.name}</span>
        {post.publishedAt && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt} title={formatDate(post.publishedAt)}>
              {formatRelativeTime(post.publishedAt, now)}
            </time>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.75} />
          {post.commentCount}
          <span className="sr-only"> bình luận</span>
        </span>
      </div>
    </article>
  );
}
