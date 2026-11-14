import { useQuery } from "@tanstack/react-query";
import { formatDateTime, formatRelativeTime, type UserSummary } from "@xom-nho/api";
import { avatarUrl } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { cn } from "@xom-nho/ui/lib/utils";
import { ChevronRight, Images, Inbox, UserRound } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import { EmptyState, ErrorState } from "@/components/common/state-message";
import { PostStatusBadge } from "@/components/common/status-badge";
import { useLastSeen } from "@/features/moderation";
import { useNow } from "@/hooks/use-now";
import { API_URL } from "@/lib/env";
import { newMembersQuery, unseenPostsPreviewQuery } from "../api/dashboard.queries";
import { numberFormat } from "../lib/format";

function initial(name: string): string {
  return (name.trim().split(/\s+/).at(-1)?.[0] ?? "?").toUpperCase();
}

/** Avatar 32px nền `muted` (avatar người khác, pages/admin.md). */
function PersonAvatar({ user }: { user: UserSummary }) {
  const src = avatarUrl(API_URL, user);
  return (
    <Avatar className="size-8 shrink-0">
      {src && <AvatarImage src={src} alt="" />}
      <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
        {initial(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** Khung danh sách trên `glass-strong`: tiêu đề, số đếm (nếu có), liên kết sang màn đầy đủ. */
function ListCard({
  id,
  title,
  count,
  countLabel,
  linkTo,
  linkLabel,
  stagger,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  countLabel?: string;
  linkTo: string;
  linkLabel: string;
  stagger: number;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="glass-strong animate-rise-in flex min-w-0 flex-col rounded-xl"
      style={{ "--stagger": stagger } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3 py-2 pr-2 pl-4">
        <div className="flex items-center gap-2">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          {count !== undefined && count > 0 && (
            <span
              aria-label={countLabel}
              className="rounded-full bg-accent px-2 text-xs leading-6 font-semibold text-accent-foreground tabular-nums"
            >
              <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
            </span>
          )}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={linkTo}>
            {linkLabel}
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      {children}
    </section>
  );
}

const rowClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-120 outline-none hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring";

function RowsSkeleton() {
  return (
    <ul className="flex flex-col gap-1 px-1 pb-1">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-full max-w-72" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * 5 bài mới nhất chưa xem (tạo sau mốc lần xem trước của màn Bài mới, cùng mốc với số trên sidebar). Bấm một bài
 * hay "Xem lần lượt" đều sang màn Bài mới, nơi xem từ bài cũ nhất.
 */
export function UnseenPostsCard({ stagger }: { stagger: number }) {
  const since = useLastSeen();
  const now = useNow();
  const query = useQuery(unseenPostsPreviewQuery(since));
  const total = query.data?.meta.total;

  return (
    <ListCard
      id="bai-moi-chua-xem"
      title="Bài mới chưa xem"
      count={total}
      countLabel={total !== undefined ? `${total} bài chưa xem` : undefined}
      linkTo="/bai-moi"
      linkLabel="Xem lần lượt"
      stagger={stagger}
    >
      {query.isPending ? (
        <RowsSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon={Inbox} title="Đã xem hết bài mới." />
        </div>
      ) : (
        <ul className="flex flex-col px-1 pb-1">
          {query.data.data.map((post) => (
            <li key={post.id} className="border-t border-border first:border-t-0">
              <Link to="/bai-moi" className={rowClass}>
                <PersonAvatar user={post.author} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate font-medium text-foreground">{post.author.name}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.createdAt} className="shrink-0">
                      {formatRelativeTime(post.createdAt, now)}
                    </time>
                    {post.mediaCount > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <span aria-hidden="true">·</span>
                        <Images aria-hidden="true" className="size-3.5" />
                        {post.mediaCount}
                        <span className="sr-only"> ảnh, video</span>
                      </span>
                    )}
                  </span>
                  <span
                    className={cn("truncate text-sm", post.title ? "font-semibold" : "font-normal")}
                  >
                    {post.title || post.excerpt || "Bài chỉ có ảnh, video"}
                  </span>
                </span>
                {post.status === "ARCHIVED" ? (
                  <PostStatusBadge status="ARCHIVED" className="shrink-0" />
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground max-sm:hidden">
                    {post.category.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ListCard>
  );
}

/** 5 thành viên mới tham gia. Bấm một người thì mở màn Thành viên lọc sẵn theo email của người đó. */
export function NewMembersCard({ stagger }: { stagger: number }) {
  const now = useNow();
  const query = useQuery(newMembersQuery);

  return (
    <ListCard
      id="thanh-vien-moi"
      title="Thành viên mới"
      linkTo="/thanh-vien"
      linkLabel="Tất cả thành viên"
      stagger={stagger}
    >
      {query.isPending ? (
        <RowsSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon={UserRound} title="Chưa có thành viên nào." />
        </div>
      ) : (
        <ul className="flex flex-col px-1 pb-1">
          {query.data.data.map((user) => (
            <li key={user.id} className="border-t border-border first:border-t-0">
              <Link to={`/thanh-vien?q=${encodeURIComponent(user.email)}`} className={rowClass}>
                <PersonAvatar user={user} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.username ? `@${user.username} · ` : ""}
                    {user.postCount > 0
                      ? `${numberFormat.format(user.postCount)} bài`
                      : "chưa có bài"}
                  </span>
                </span>
                <time
                  dateTime={user.createdAt}
                  title={formatDateTime(user.createdAt, now)}
                  className="shrink-0 text-xs text-muted-foreground tabular-nums"
                >
                  {formatRelativeTime(user.createdAt, now)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ListCard>
  );
}
