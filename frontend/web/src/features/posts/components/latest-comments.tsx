import { type CommentPreview, formatDate, formatRelativeTime } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import Link from "next/link";
import { initials } from "@/lib/initials";
import { userAvatarSrc } from "@/lib/media-url";

/**
 * Hai bình luận gốc mới nhất dưới thẻ bài (docs/tinh-nang.md mục 2.1, MASTER mục 7): avatar 24, tên, thời gian,
 * nội dung chữ thường tối đa 2 dòng. Backend trả mới nhất trước; ở đây xếp lại cũ trước để đọc xuôi như
 * cuộc trò chuyện. Phần còn lại nằm dưới lớp liên kết của thẻ: bấm vào là mở bài, xem đủ bình luận.
 */
export function LatestComments({ comments, now }: { comments: CommentPreview[]; now: Date }) {
  if (comments.length === 0) return null;

  return (
    <ul aria-label="Bình luận mới" className="flex flex-col gap-3">
      {[...comments].reverse().map((comment) => (
        <li key={comment.id} className="flex gap-2">
          <Avatar size="sm" className="mt-0.5">
            <AvatarImage src={userAvatarSrc(comment.author) ?? undefined} alt="" />
            <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              {comment.author.username ? (
                <Link
                  href={`/u/${comment.author.username}`}
                  className="relative z-10 rounded-sm font-semibold text-card-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {comment.author.name}
                </Link>
              ) : (
                <span className="font-semibold text-card-foreground">{comment.author.name}</span>
              )}
              <time
                dateTime={comment.createdAt}
                title={formatDate(comment.createdAt)}
                className="text-muted-foreground"
              >
                {formatRelativeTime(comment.createdAt, now)}
              </time>
            </p>
            <p className="line-clamp-2 text-base break-words whitespace-pre-line text-card-foreground">
              {comment.content}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
