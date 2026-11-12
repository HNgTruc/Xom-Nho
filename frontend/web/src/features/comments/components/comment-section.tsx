import { COMMENT_MESSAGES } from "@xom-nho/api";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { getCurrentUser } from "@/features/auth";
import { userAvatarSrc } from "@/lib/media-url";
import { requestTime } from "@/lib/request-time";
import { getComments } from "../api/get-comments";
import { CommentThreads } from "./comment-threads";
import { CommentsUnavailable } from "./comments-unavailable";

/**
 * Khối bình luận ở cuối trang bài (server): lấy bình luận và người đang xem, rồi giao cho phần tương tác.
 * Đọc cookie nên nằm trong `<Suspense>`; bài hiện trước, bình luận tới sau.
 */
export async function CommentSection({
  postId,
  canComment,
}: {
  postId: string;
  canComment: boolean;
}) {
  const [viewer, threads, now] = await Promise.all([
    getCurrentUser(),
    getComments(postId),
    requestTime(),
  ]);
  // Trang bài đã bắt đăng nhập; phiên vừa hết thì thôi không hiện khối bình luận
  if (!viewer) return null;

  return threads === null ? (
    <section aria-label={COMMENT_MESSAGES.HEADING} className="border-t border-border pt-6">
      <CommentsUnavailable />
    </section>
  ) : (
    <CommentThreads
      postId={postId}
      initialThreads={threads}
      viewer={{ id: viewer.id, name: viewer.name, avatarSrc: userAvatarSrc(viewer) }}
      now={now.toISOString()}
      canComment={canComment}
    />
  );
}

/** Giữ chỗ khối bình luận: tiêu đề, ô viết, hai bình luận. */
export function CommentSectionSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Đang tải bình luận"
      className="flex flex-col gap-6 border-t border-border pt-6"
    >
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-28 w-full" />
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
