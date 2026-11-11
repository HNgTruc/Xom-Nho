import { POST_STATUS_NOTES, POST_STATUSES, type PostDetail, rejectedNote } from "@xom-nho/shared";
import { CircleAlert, Info } from "lucide-react";
import { PostStatusBadge } from "./post-status-badge";

/**
 * Dấu hiệu kiểm duyệt trên bài chưa đăng (MASTER mục 7, chống "no moderation cues"): badge trạng thái
 * kèm một câu giải thích. Bị từ chối thì hiện lý do trong hộp màu destructive nhạt. Bài đã đăng: không hiện gì.
 */
export function PostStatusNote({ post }: { post: Pick<PostDetail, "status" | "rejectReason"> }) {
  if (post.status === POST_STATUSES.PUBLISHED) return null;

  const rejected = post.status === POST_STATUSES.REJECTED;
  const message = rejected
    ? rejectedNote(post.rejectReason)
    : (POST_STATUS_NOTES[post.status as keyof typeof POST_STATUS_NOTES] ?? POST_STATUS_NOTES.DRAFT);
  const Icon = rejected ? CircleAlert : Info;

  return (
    // Không dùng role="alert": nội dung có sẵn khi mở trang, không phải thông báo mới xuất hiện
    <div
      className={
        rejected
          ? // Chữ destructive trên nền destructive 10%: như badge destructive của ui (đã tính tương phản)
            "flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive"
          : "flex flex-col gap-2 rounded-md border border-border bg-muted p-4 text-foreground"
      }
    >
      <PostStatusBadge status={post.status} />
      <p className="flex items-start gap-2 text-base">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
        <span>{message}</span>
      </p>
    </div>
  );
}
