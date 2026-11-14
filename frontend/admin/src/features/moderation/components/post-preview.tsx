import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AdminPostListItem,
  type CommentItem,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@xom-nho/api";
import { avatarUrl, fileUrl } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { toast } from "@xom-nho/ui/components/toaster";
import { Eye, EyeOff, Heart, MessageCircle, ThumbsDown } from "lucide-react";
import { ErrorState } from "@/components/common/state-message";
import { PostStatusBadge, RoleBadge } from "@/components/common/status-badge";
import { useNow } from "@/hooks/use-now";
import { api } from "@/lib/api";
import { API_URL } from "@/lib/env";
import { authorQuery, postCommentsQuery, postDetailQuery } from "../api/moderation.queries";

const numberFormat = new Intl.NumberFormat("vi-VN");
const LATEST_COMMENTS = 3;

function initial(name: string): string {
  return (name.trim().split(/\s+/).at(-1)?.[0] ?? "?").toUpperCase();
}

/** Khung tác giả (pages/admin.md "Bài mới"): vai trò, ngày tham gia, số bài, số bài đang bị ẩn. */
function AuthorBox({ post }: { post: AdminPostListItem }) {
  const author = useQuery(authorQuery(post.author.id));
  const src = avatarUrl(API_URL, post.author);
  const now = useNow();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar className="size-10">
        {src && <AvatarImage src={src} alt="" />}
        <AvatarFallback className="bg-muted text-foreground">
          {initial(post.author.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{post.author.name}</span>
          {author.data && <RoleBadge role={author.data.role} />}
        </p>
        <p className="text-sm text-muted-foreground">
          {post.author.username && `@${post.author.username} · `}đăng lúc{" "}
          <time dateTime={post.createdAt}>{formatDateTime(post.createdAt, now)}</time>
        </p>
      </div>
      {/* Số liệu tác giả: số bị ẩn là số đang ẩn, bài đã hiện lại không còn tính (docs/api.md) */}
      <dl className="flex gap-4 text-sm">
        {author.data ? (
          <>
            <div>
              <dt className="text-muted-foreground">Tham gia</dt>
              <dd className="font-medium">{formatDate(author.data.createdAt, now)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Bài đã đăng</dt>
              <dd className="font-medium tabular-nums">
                {numberFormat.format(author.data.postCount)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Đang bị ẩn</dt>
              <dd className="font-medium tabular-nums">
                {author.data.hiddenPostCount > 0
                  ? `${author.data.hiddenPostCount} bài`
                  : "Không có"}
              </dd>
            </div>
          </>
        ) : author.isError ? null : (
          <Skeleton className="h-10 w-48" />
        )}
      </dl>
    </div>
  );
}

/** Ba bình luận mới nhất, gồm cả bình luận đã ẩn (mờ, nhãn "Đã ẩn"); ẩn, hiện lại ngay tại chỗ. */
function LatestComments({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const now = useNow();
  const comments = useQuery(postCommentsQuery(postId));
  const toggle = useMutation({
    mutationFn: ({ id, hide }: { id: string; hide: boolean }) =>
      hide ? api.admin.comments.hide(id) : api.admin.comments.show(id),
    onSuccess: (_, { id, hide }) => {
      toast(hide ? "Đã ẩn bình luận" : "Đã hiện lại bình luận", {
        action: hide
          ? { label: "Hoàn tác", onClick: () => toggle.mutate({ id, hide: false }) }
          : undefined,
      });
    },
    onError: () => toast.error("Chưa lưu được. Bạn thử lại nhé."),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: postCommentsQuery(postId).queryKey }),
  });

  if (comments.isPending) return <Skeleton className="h-16 w-full" />;
  if (comments.isError) return null;

  const flat: CommentItem[] = comments.data.flatMap((thread) => [thread, ...thread.replies]);
  const latest = flat
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, LATEST_COMMENTS);
  if (latest.length === 0)
    return <p className="text-sm text-muted-foreground">Chưa có bình luận.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {latest.map((comment) => {
        const hidden = comment.status === "HIDDEN";
        return (
          <li
            key={comment.id}
            className={hidden ? "flex items-start gap-3 opacity-60" : "flex items-start gap-3"}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{comment.author.name}</span>
                <time dateTime={comment.createdAt} className="text-muted-foreground">
                  {formatRelativeTime(comment.createdAt, now)}
                </time>
                {hidden && <span className="text-xs text-muted-foreground">Đã ẩn</span>}
              </p>
              <p className="text-sm whitespace-pre-line">{comment.content}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 max-lg:h-10"
              onClick={() => toggle.mutate({ id: comment.id, hide: !hidden })}
            >
              {hidden ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
              {hidden ? "Hiện lại" : "Ẩn"}
              <span className="sr-only"> bình luận của {comment.author.name}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Xem trước một bài ở màn Bài mới (pages/admin.md "Bài mới"): khung tác giả, nội dung đầy đủ (chữ thường giữ xuống
 * dòng, hiện dạng text, không render HTML), ảnh và video, số thích, không thích, bình luận, ba bình luận mới nhất.
 */
export function PostPreview({ post }: { post: AdminPostListItem }) {
  const detail = useQuery(postDetailQuery(post.slug));

  return (
    <article aria-labelledby={`bai-${post.id}`} className="flex flex-col gap-5">
      <AuthorBox post={post} />

      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium">
            {post.category.name}
          </span>
          {post.status !== "PUBLISHED" && <PostStatusBadge status={post.status} />}
        </p>
        <h2 id={`bai-${post.id}`} className={post.title ? "text-xl font-semibold" : "sr-only"}>
          {post.title || `Bài của ${post.author.name}`}
        </h2>
        {post.rejectReason && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Lý do ẩn: {post.rejectReason}
          </p>
        )}
        {detail.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : detail.isError ? (
          <ErrorState message="Chưa tải được nội dung bài." onRetry={() => void detail.refetch()} />
        ) : (
          <>
            {detail.data.content && (
              <p className="text-base leading-relaxed whitespace-pre-line">{detail.data.content}</p>
            )}
            {detail.data.media.length > 0 && (
              <ul
                aria-label="Ảnh và video trong bài"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {detail.data.media.map((media, index) => (
                  <li key={media.id} className="aspect-square overflow-hidden rounded-md bg-muted">
                    {media.kind === "VIDEO" ? (
                      // Video người dùng tải lên không có tệp phụ đề; trưởng xóm xem để kiểm duyệt
                      // oxlint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={fileUrl(API_URL, media.id)}
                        controls
                        preload="metadata"
                        aria-label={`Video ${index + 1}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <img
                        src={fileUrl(API_URL, media.id)}
                        alt={`Ảnh ${index + 1} trong bài`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <p className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart aria-hidden="true" className="size-4" />
            {numberFormat.format(post.likeCount)} thích
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown aria-hidden="true" className="size-4" />
            {numberFormat.format(post.dislikeCount)} không thích
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle aria-hidden="true" className="size-4" />
            {numberFormat.format(post.commentCount)} bình luận
          </span>
        </p>
      </div>

      <section
        aria-labelledby={`binh-luan-${post.id}`}
        className="flex flex-col gap-3 border-t border-border pt-4"
      >
        <h3 id={`binh-luan-${post.id}`} className="text-sm font-semibold">
          Bình luận mới nhất
        </h3>
        <LatestComments postId={post.id} />
      </section>
    </article>
  );
}
