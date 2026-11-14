import {
  archivedNote,
  POST_STATUS_NOTES,
  POST_STATUSES,
  type PostDetail,
  rejectedNote,
} from "@xom-nho/api";
import { CircleAlert, Info } from "lucide-react";
import { PostStatusBadge } from "./post-status-badge";

/** Câu giải thích theo trạng thái; bị từ chối hay bị trưởng xóm ẩn thì kèm lý do. */
function noteOf(post: Pick<PostDetail, "status" | "rejectReason">): string {
  if (post.status === POST_STATUSES.REJECTED) return rejectedNote(post.rejectReason);
  if (post.status === POST_STATUSES.ARCHIVED) return archivedNote(post.rejectReason);
  return (
    POST_STATUS_NOTES[post.status as keyof typeof POST_STATUS_NOTES] ?? POST_STATUS_NOTES.DRAFT
  );
}

/**
 * Dấu hiệu kiểm duyệt trên bài chưa đăng hoặc đã ẩn (MASTER mục 6, 7, chống "no moderation cues"): badge trạng thái
 * kèm một câu giải thích. Bị từ chối, hoặc bị trưởng xóm ẩn kèm lý do (pages/admin.md mục "Ẩn bài"), thì hiện lý
 * do trong hộp màu destructive nhạt. Chỉ tác giả và trưởng xóm mở được trang này. Bài đã đăng: không hiện gì.
 */
export function PostStatusNote({ post }: { post: Pick<PostDetail, "status" | "rejectReason"> }) {
  if (post.status === POST_STATUSES.PUBLISHED) return null;

  const moderated =
    post.status === POST_STATUSES.REJECTED ||
    (post.status === POST_STATUSES.ARCHIVED && post.rejectReason !== null);
  const Icon = moderated ? CircleAlert : Info;

  return (
    // Không dùng role="alert": nội dung có sẵn khi mở trang, không phải thông báo mới xuất hiện
    <div
      className={
        moderated
          ? // Chữ destructive trên nền destructive 10%: như badge destructive của ui (đã tính tương phản)
            "flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive"
          : "flex flex-col gap-2 rounded-md border border-border bg-muted p-4 text-foreground"
      }
    >
      <PostStatusBadge status={post.status} />
      <p className="flex items-start gap-2 text-base">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />
        <span>{noteOf(post)}</span>
      </p>
    </div>
  );
}
