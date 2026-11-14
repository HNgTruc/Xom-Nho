import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDateTime } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { cn } from "@xom-nho/ui/lib/utils";
import {
  ArrowLeft,
  CheckCheck,
  ChevronRight,
  EyeOff,
  Inbox,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { PageHeader } from "@/components/common/page-header";
import { Segmented } from "@/components/common/segmented";
import { EmptyState, ErrorState } from "@/components/common/state-message";
import { HidePostDialog, usePostActions } from "@/features/posts";
import { useNow } from "@/hooks/use-now";
import { useUrlState } from "@/hooks/use-url-state";
import { WEB_URL } from "@/lib/env";
import { newPostsQuery } from "../api/moderation.queries";
import { NewPostList } from "../components/new-post-list";
import { PostPreview } from "../components/post-preview";
import { markAllSeen, useLastSeen } from "../lib/last-seen";

type From = "moc" | "24h" | "7d";
const HOUR = 60 * 60 * 1000;

/** Đầu khoảng "24 giờ qua", "7 ngày qua" tính tới lúc gọi; "Lần xem trước" dùng mốc đã lưu nên trả rỗng. */
function windowSince(from: From): string {
  if (from === "24h") return new Date(Date.now() - 24 * HOUR).toISOString();
  if (from === "7d") return new Date(Date.now() - 7 * 24 * HOUR).toISOString();
  return "";
}

/** Phím tắt không chạy khi đang gõ, khi giữ phím bổ trợ (Ctrl+K của trình duyệt...), hay khi có hộp thoại mở. */
function ignoreKey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return true;
  const target = event.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, [contenteditable='true']")) return true;
  return document.querySelector("[role='dialog'], [role='alertdialog'], [role='menu']") !== null;
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-border bg-muted px-1.5 font-sans text-xs font-medium">
      {children}
    </kbd>
  );
}

/**
 * Màn Bài mới (pages/admin.md "Bài mới", chốt 2026-11-13, 2026-11-14): bài đăng thẳng lên xóm từ lần xem trước,
 * cũ nhất trước, trưởng xóm đọc lần lượt và ẩn bài có vấn đề. Bài đã mở không biến mất (mờ đi, "Đã xem"); mốc
 * "lần xem trước" chỉ dời khi bấm "Đánh dấu đã xem hết". Phím `J`/`K` chuyển bài, `H` ẩn bài, `O` mở trên Xóm Nhỏ.
 * Dưới 1024px: danh sách trước, chọn bài thì sang trang xem bài, có nút quay lại.
 */
export function ModerationPage() {
  const lastSeen = useLastSeen();
  const { params, set } = useUrlState();
  const from: From = params.tu === "24h" || params.tu === "7d" ? params.tu : "moc";

  // Mốc 24 giờ, 7 ngày tính một lần lúc mở trang hoặc lúc chọn (khóa query ổn định, không đổi mỗi lần vẽ)
  const [windowStart, setWindowStart] = useState(() => windowSince(from));
  const since = from === "moc" ? lastSeen : windowStart;

  const query = useInfiniteQuery(newPostsQuery(since));
  const posts = useMemo(() => query.data?.pages.flatMap((page) => page.data) ?? [], [query.data]);
  const total = query.data?.pages[0]?.meta.total ?? 0;

  // Vị trí bài đang xem gắn với mốc: đổi mốc thì tự về bài đầu (không cần effect đặt lại)
  const [cursor, setCursor] = useState({ since, index: 0 });
  const index = cursor.since === since ? cursor.index : 0;
  const setIndex = (next: number) => setCursor({ since, index: next });
  // Bài đã mở trong lần xem này (mờ đi, nhãn "Đã xem"); bài đang mở không tính, vẫn hiện bình thường
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [showPost, setShowPost] = useState(false);
  const [hideOpen, setHideOpen] = useState(false);
  const actions = usePostActions();

  const current = posts[Math.min(index, posts.length - 1)];

  /** Chuyển bài: bài đang rời và bài mới mở đều tính là đã xem. Hết trang thì tải thêm rồi mới chuyển. */
  function select(next: number) {
    if (next < 0) return;
    const go = (list: typeof posts) => {
      const target = list[next];
      if (!target) return;
      setSeen((prev) => {
        const updated = new Set(prev).add(target.id);
        if (current) updated.add(current.id);
        return updated;
      });
      setIndex(next);
      setShowPost(true);
    };
    if (next < posts.length) go(posts);
    else if (query.hasNextPage) {
      void query
        .fetchNextPage()
        .then((result) => go(result.data?.pages.flatMap((page) => page.data) ?? []));
    }
  }

  function openOnSite() {
    if (current) window.open(`${WEB_URL}/bai-viet/${current.slug}`, "_blank", "noopener");
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (ignoreKey(event)) return;
      const key = event.key.toLowerCase();
      if (key === "j") select(index + 1);
      else if (key === "k") select(index - 1);
      else if (key === "h" && current?.status === "PUBLISHED") setHideOpen(true);
      else if (key === "o") openOnSite();
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const now = useNow();
  // Cùng con số gốc với sidebar (bài từ mốc), số đã mở trong lần xem này ghi riêng: trừ đi thì hai chỗ lệch số
  const opened = current ? new Set([...seen, current.id]).size : seen.size;
  const scope = { moc: "từ lần xem trước", "24h": "trong 24 giờ qua", "7d": "trong 7 ngày qua" }[
    from
  ];

  const header = (
    <PageHeader
      title="Bài mới"
      description={
        query.data && total > 0
          ? `${total} bài ${scope} · đã mở ${opened}. Bài đăng thẳng lên xóm, bạn xem lại và ẩn bài có vấn đề`
          : "Bài đăng thẳng lên xóm, bạn xem lại và ẩn bài có vấn đề"
      }
      actions={
        <Button
          variant="outline"
          disabled={from !== "moc" || total === 0}
          onClick={() => {
            markAllSeen();
            setSeen(new Set());
          }}
        >
          <CheckCheck aria-hidden="true" />
          Đánh dấu đã xem hết
        </Button>
      }
    />
  );

  const filters = (
    <div className="glass flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-4 py-3">
      <Segmented
        label="Bài đăng từ"
        value={from}
        options={[
          { value: "moc", label: "Lần xem trước" },
          { value: "24h", label: "24 giờ" },
          { value: "7d", label: "7 ngày" },
        ]}
        onChange={(value) => {
          setWindowStart(windowSince(value));
          set({ tu: value === "moc" ? undefined : value });
        }}
      />
      <p className="text-sm text-muted-foreground">
        Lần xem trước: <time dateTime={lastSeen}>{formatDateTime(lastSeen, now)}</time>
      </p>
      <p className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground max-lg:hidden">
        <span className="inline-flex items-center gap-1">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> chuyển bài
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>H</Kbd> ẩn bài
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>O</Kbd> mở trên Xóm Nhỏ
        </span>
      </p>
    </div>
  );

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        {header}
        {filters}
        <div
          className="glass-strong h-96 animate-pulse rounded-xl"
          aria-busy="true"
          aria-label="Đang tải"
        />
      </div>
    );
  }

  if (query.isError || !current) {
    return (
      <div className="flex flex-col gap-3">
        {header}
        {filters}
        <div className="glass rounded-xl">
          {query.isError ? (
            <ErrorState onRetry={() => void query.refetch()} />
          ) : (
            <EmptyState
              icon={Inbox}
              title="Đã xem hết bài mới."
              description={
                from === "moc"
                  ? "Bài đăng sau lần xem trước sẽ hiện ở đây. Muốn xem lại thì chọn 24 giờ hoặc 7 ngày."
                  : "Không có bài nào trong khoảng này."
              }
              action={
                <Button asChild variant="outline">
                  <Link to="/">Về Tổng quan</Link>
                </Button>
              }
            />
          )}
        </div>
      </div>
    );
  }

  const position = Math.min(index, posts.length - 1);
  const isLast = position >= total - 1;

  return (
    <div className="flex flex-col gap-3">
      {header}
      {filters}

      <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Danh sách: trên điện thoại ẩn đi khi đang xem một bài */}
        <nav
          aria-label="Bài mới"
          className={cn(
            "glass flex flex-col gap-2 rounded-xl p-2 lg:sticky lg:top-3 lg:max-h-[calc(100dvh-1.5rem)] lg:overflow-y-auto",
            showPost && "max-lg:hidden",
          )}
        >
          <NewPostList posts={posts} selectedId={current.id} seen={seen} onSelect={select} />
          {query.hasNextPage && (
            <Button
              variant="ghost"
              loading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              Xem thêm bài
            </Button>
          )}
        </nav>

        <section
          aria-label="Xem bài"
          className={cn("glass-strong flex flex-col rounded-xl", !showPost && "max-lg:hidden")}
        >
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit lg:hidden"
              onClick={() => setShowPost(false)}
            >
              <ArrowLeft aria-hidden="true" />
              Danh sách bài
            </Button>
            <PostPreview post={current} />
          </div>

          {/* Thanh hành động dính đáy vùng xem bài (pages/admin.md: "Ẩn bài" nút viền, "Bài tiếp theo") */}
          <div className="glass-bar sticky bottom-0 mt-auto flex flex-wrap items-center gap-2 rounded-b-xl px-4 py-3 sm:px-5">
            <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
              Bài {position + 1} trong {total}
            </p>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="ghost" onClick={openOnSite} className="max-sm:w-10 max-sm:px-0">
                <SquareArrowOutUpRight aria-hidden="true" />
                <span className="max-sm:sr-only">Mở trên Xóm Nhỏ</span>
              </Button>
              {current.status === "PUBLISHED" && (
                <Button variant="outline" onClick={() => setHideOpen(true)}>
                  <EyeOff aria-hidden="true" />
                  Ẩn bài
                </Button>
              )}
              <Button disabled={isLast} onClick={() => select(position + 1)}>
                Bài tiếp theo
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      <HidePostDialog
        open={hideOpen}
        onOpenChange={setHideOpen}
        title={`Ẩn bài của ${current.author.name}?`}
        onConfirm={(reason) => actions.archive.mutateAsync({ ids: [current.id], reason })}
      />
    </div>
  );
}
