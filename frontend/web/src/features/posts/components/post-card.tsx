import { formatDate, formatRelativeTime, type PostListItem } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { initials } from "@/lib/initials";
import { CategoryBadge } from "./category-badge";
import { PostMediaGrid } from "./post-media";

/**
 * Thẻ bài trong feed (MASTER mục 7): badge danh mục, tiêu đề, tóm tắt 2 dòng, ảnh/video, rồi tác giả, thời gian,
 * số bình luận. Bài soạn kiểu mạng xã hội không có tiêu đề: phần đầu nội dung làm chữ chính (4 dòng).
 * Cả thẻ bấm được nhờ liên kết tiêu đề phủ kín thẻ (`after:inset-0`); badge danh mục, tag nằm trên lớp đó
 * (`relative z-10`) nên vẫn bấm riêng được, không lồng thẻ `<a>` trong nhau.
 * Tấm `glass` (MASTER 2.4). Hover: nổi lên 2px, kính đặc hơn, viền và bóng rõ lên (MASTER 5). Bóng đổi ngay,
 * không chuyển mượt: bóng lớn chuyển mượt phải vẽ lại mỗi khung hình.
 * Số bình luận nằm trong viên `accent` (xanh nhạt), điểm nhấn như viên màu trong mẫu thiết kế.
 */
const cardLinkClass = "after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none";

export function PostCard({ post, now }: { post: PostListItem; now: Date }) {
  return (
    <article className="glass relative flex flex-col gap-3 rounded-xl p-4 transition-[translate,background-color,border-color] duration-200 ease-standard hover:-translate-y-0.5 hover:border-glass-border-hover hover:bg-glass-strong hover:shadow-glass-hover has-[[data-card-link]:focus-visible]:ring-2 has-[[data-card-link]:focus-visible]:ring-ring has-[[data-card-link]:focus-visible]:ring-offset-2 has-[[data-card-link]:focus-visible]:ring-offset-background sm:p-5">
      <CategoryBadge category={post.category} className="relative z-10" />

      {post.title ? (
        <>
          <h2 className="text-lg font-semibold text-card-foreground">
            <Link href={`/bai-viet/${post.slug}`} data-card-link className={cardLinkClass}>
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="line-clamp-2 text-base text-muted-foreground">{post.excerpt}</p>
          )}
        </>
      ) : (
        // Không có tiêu đề: chữ chính là nội dung; chỉ có ảnh thì liên kết chỉ có nhãn cho trình đọc màn hình
        <h2 className="line-clamp-4 text-base whitespace-pre-line text-card-foreground">
          <Link href={`/bai-viet/${post.slug}`} data-card-link className={cardLinkClass}>
            {post.excerpt || <span className="sr-only">Bài của {post.author.name}</span>}
          </Link>
        </h2>
      )}

      <PostMediaGrid media={post.media} authorName={post.author.name} />

      {post.tags.length > 0 && (
        <ul aria-label="Thẻ" className="relative z-10 flex w-fit flex-wrap gap-x-3 gap-y-1">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                href={`/tag/${tag.slug}`}
                className="rounded-sm text-sm text-muted-foreground hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
        {post.author.username ? (
          <Link
            href={`/u/${post.author.username}`}
            className="relative z-10 rounded-sm font-medium text-card-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {post.author.name}
          </Link>
        ) : (
          <span className="font-medium text-card-foreground">{post.author.name}</span>
        )}
        {post.publishedAt && (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt} title={formatDate(post.publishedAt)}>
              {formatRelativeTime(post.publishedAt, now)}
            </time>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-accent px-2 font-medium text-accent-foreground">
          <MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.75} />
          {post.commentCount}
          <span className="sr-only"> bình luận</span>
        </span>
      </div>
    </article>
  );
}
