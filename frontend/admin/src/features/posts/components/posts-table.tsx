import { useQuery } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  ADMIN_POST_SORTS,
  type AdminListPostsQuery,
  type AdminPostListItem,
  formatDateTime,
  POST_STATUS_LABELS,
  type PostStatus,
} from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { Input } from "@xom-nho/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@xom-nho/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@xom-nho/ui/components/tabs";
import {
  Eye,
  EyeOff,
  FileSearch,
  MoreHorizontal,
  Search,
  SquareArrowOutUpRight,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/state-message";
import { PostStatusBadge } from "@/components/common/status-badge";
import {
  type AdminColumnDef,
  adminColumnHelper,
  selectColumn,
} from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { WEB_URL } from "@/lib/env";
import { adminPostStatsQuery, adminPostsListQuery, categoriesQuery } from "../api/posts.queries";
import { usePostActions } from "../hooks/use-post-actions";
import { HidePostDialog } from "./hide-post-dialog";
import { AuthorCell, PostTitleCell } from "./post-cells";

const numberFormat = new Intl.NumberFormat("vi-VN");
const ALL = "ALL";
const emptyRows: AdminPostListItem[] = [];
/** Luôn hiện: Tất cả, Đã đăng, Đã ẩn. Trạng thái cũ (nháp, chờ duyệt, bị từ chối) chỉ hiện khi còn bài (ADR 0008). */
const MAIN_STATUSES: PostStatus[] = ["PUBLISHED", "ARCHIVED"];
const LEGACY_STATUSES: PostStatus[] = ["DRAFT", "PENDING", "REJECTED"];

/** Nút thao tác trong dòng bảng: 32px trên máy tính, 40px trên màn cảm ứng (admin.md "Chữ"). */
const rowButton = "size-8 max-lg:size-10";

type Dialog =
  | { kind: "hide"; posts: AdminPostListItem[] }
  | { kind: "delete"; posts: AdminPostListItem[] }
  | null;

/**
 * Bảng mọi bài (pages/admin.md "Bảng dữ liệu", "Bảng Bài viết"; docs/tinh-nang.md mục 4.3): tab trạng thái có số
 * đếm, tìm (đợi 300ms sau khi ngừng gõ), lọc danh mục, sắp mới/cũ, chọn nhiều thì thanh "Đã chọn N bài" thay chỗ
 * thanh lọc (cùng chiều cao, bảng không bị xô), menu thao tác từng dòng. Bài đang ẩn mờ 60%. Mọi bộ lọc trên URL.
 */
export function PostsTable({
  query,
  onChange,
}: {
  query: AdminListPostsQuery;
  onChange: (
    values: Partial<Record<keyof AdminListPostsQuery, string | number | undefined>>,
    opts?: { resetPage?: boolean },
  ) => void;
}) {
  const id = useId();
  const list = useQuery(adminPostsListQuery(query));
  const counts = useQuery(adminPostStatsQuery("all"));
  const categories = useQuery(categoriesQuery);
  const actions = usePostActions();
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [dialog, setDialog] = useState<Dialog>(null);

  // Ô tìm: gõ ngay trên ô, URL (và yêu cầu) đổi sau 300ms
  const [search, setSearch] = useState(query.q ?? "");
  const debouncedSearch = useDebouncedValue(search);
  useEffect(() => {
    if ((query.q ?? "") !== debouncedSearch.trim())
      onChange({ q: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, query.q, onChange]);

  // Đổi trang, bộ lọc thì bỏ chọn: dòng đã chọn không còn trên màn hình
  const queryKey = JSON.stringify(query);
  useEffect(() => setSelection({}), [queryKey]);

  const rows = list.data?.data ?? emptyRows;
  const selected = rows.filter((post) => selection[post.id]);
  const now = new Date();

  const columns = useMemo<AdminColumnDef<AdminPostListItem>[]>(() => {
    const helper = adminColumnHelper<AdminPostListItem>();
    return [
      selectColumn<AdminPostListItem>((post) => `Chọn bài ${post.title || post.excerpt}`),
      helper.display({
        id: "title",
        header: "Bài viết",
        cell: ({ row }) => <PostTitleCell post={row.original} />,
      }),
      helper.display({
        id: "author",
        header: "Tác giả",
        cell: ({ row }) => <AuthorCell author={row.original.author} />,
      }),
      helper.display({
        id: "category",
        header: "Danh mục",
        cell: ({ row }) => <span className="whitespace-nowrap">{row.original.category.name}</span>,
      }),
      helper.display({
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <span className="flex flex-col items-start gap-1">
            <PostStatusBadge status={row.original.status} />
            {row.original.rejectReason && (
              <span
                className="line-clamp-1 max-w-48 text-xs text-muted-foreground"
                title={row.original.rejectReason}
              >
                {row.original.rejectReason}
              </span>
            )}
          </span>
        ),
      }),
      helper.display({
        id: "likes",
        header: "Thích",
        cell: ({ row }) => (
          <span className="tabular-nums">{numberFormat.format(row.original.likeCount)}</span>
        ),
      }),
      helper.display({
        id: "comments",
        header: "Bình luận",
        cell: ({ row }) => (
          <span className="tabular-nums">{numberFormat.format(row.original.commentCount)}</span>
        ),
      }),
      helper.display({
        id: "createdAt",
        header: "Đăng lúc",
        cell: ({ row }) => (
          <time
            dateTime={row.original.createdAt}
            className="whitespace-nowrap text-muted-foreground"
          >
            {formatDateTime(row.original.createdAt, now)}
          </time>
        ),
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Thao tác</span>,
        cell: ({ row }) => {
          const post = row.original;
          const hidden = post.status === "ARCHIVED";
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={rowButton}
                  aria-label={`Thao tác với bài ${post.title || post.excerpt}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={`${WEB_URL}/bai-viet/${post.slug}`} target="_blank" rel="noopener">
                    <SquareArrowOutUpRight aria-hidden="true" />
                    Mở trên Xóm Nhỏ
                  </a>
                </DropdownMenuItem>
                {hidden ? (
                  <DropdownMenuItem onSelect={() => actions.restore.mutate([post.id])}>
                    <Eye aria-hidden="true" />
                    Hiện lại
                  </DropdownMenuItem>
                ) : post.status === "PUBLISHED" ? (
                  <DropdownMenuItem onSelect={() => setDialog({ kind: "hide", posts: [post] })}>
                    <EyeOff aria-hidden="true" />
                    Ẩn bài…
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDialog({ kind: "delete", posts: [post] })}
                >
                  <Trash2 aria-hidden="true" />
                  Xóa…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ];
    // `now`, `actions` đổi mỗi lần vẽ nhưng chỉ dùng khi bấm hoặc để định dạng giờ; cột không cần dựng lại
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byStatus = counts.data?.byStatus;
  const total = byStatus
    ? Object.values(byStatus).reduce((sum, value) => sum + value, 0)
    : undefined;
  const tabs = [
    { value: ALL, label: "Tất cả", count: total },
    ...MAIN_STATUSES.map((status) => ({
      value: status,
      label: POST_STATUS_LABELS[status],
      count: byStatus?.[status],
    })),
    ...LEGACY_STATUSES.filter((status) => (byStatus?.[status] ?? 0) > 0).map((status) => ({
      value: status,
      label: POST_STATUS_LABELS[status],
      count: byStatus?.[status],
    })),
  ];
  const activeTab = query.status ?? ALL;
  const filtered = Boolean(query.q || query.category || query.status);

  const hideTargets = dialog?.kind === "hide" ? dialog.posts : [];
  const deleteTargets = dialog?.kind === "delete" ? dialog.posts : [];
  const selectedHidden = selected.filter((post) => post.status === "ARCHIVED");
  const selectedPublished = selected.filter((post) => post.status === "PUBLISHED");

  return (
    <section aria-labelledby={`${id}-heading`} className="flex flex-col gap-3">
      <h2 id={`${id}-heading`} className="sr-only">
        Mọi bài
      </h2>
      <Tabs
        value={activeTab}
        onValueChange={(value) => onChange({ status: value === ALL ? undefined : value })}
      >
        <TabsList aria-label="Lọc theo trạng thái">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.count !== undefined && (
                <span className="rounded-full bg-foreground/8 px-1.5 text-xs tabular-nums in-data-[state=active]:bg-primary-foreground/20">
                  {numberFormat.format(tab.count)}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="flex flex-col gap-3">
          {/* Thanh lọc, hoặc thanh hành động hàng loạt thay chỗ khi đang chọn (cùng chiều cao 56px) */}
          {selected.length > 0 ? (
            <div className="glass flex min-h-14 flex-wrap items-center gap-2 rounded-xl px-3 py-2">
              <span
                className="glass-primary rounded-full px-3 py-1 text-sm font-medium"
                aria-live="polite"
              >
                Đã chọn {selected.length} bài
              </span>
              {selectedPublished.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialog({ kind: "hide", posts: selectedPublished })}
                >
                  <EyeOff aria-hidden="true" />
                  Ẩn
                </Button>
              )}
              {selectedHidden.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={actions.restore.isPending}
                  onClick={() => actions.restore.mutate(selectedHidden.map((post) => post.id))}
                >
                  <Eye aria-hidden="true" />
                  Hiện lại
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog({ kind: "delete", posts: selected })}
              >
                <Trash2 aria-hidden="true" />
                Xóa…
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setSelection({})}
              >
                <X aria-hidden="true" />
                Bỏ chọn
              </Button>
            </div>
          ) : (
            <div className="glass flex min-h-14 flex-wrap items-center gap-2 rounded-xl px-3 py-2">
              <div className="relative min-w-56 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <label htmlFor={`${id}-search`} className="sr-only">
                  Tìm bài
                </label>
                <Input
                  id={`${id}-search`}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo tiêu đề, nội dung, thẻ"
                  className="pl-9"
                />
              </div>
              <label htmlFor={`${id}-category`} className="sr-only">
                Danh mục
              </label>
              <Select
                value={query.category ?? ALL}
                onValueChange={(value) => onChange({ category: value === ALL ? undefined : value })}
              >
                <SelectTrigger id={`${id}-category`} className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Mọi danh mục</SelectItem>
                  {categories.data?.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label htmlFor={`${id}-sort`} className="sr-only">
                Sắp xếp
              </label>
              <Select value={query.sort} onValueChange={(value) => onChange({ sort: value })}>
                <SelectTrigger id={`${id}-sort`} className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ADMIN_POST_SORTS.NEWEST}>Mới đăng trước</SelectItem>
                  <SelectItem value={ADMIN_POST_SORTS.OLDEST}>Cũ trước</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DataTable
            columns={columns}
            data={rows}
            getRowId={(post) => post.id}
            caption={`Bài viết, ${query.sort === ADMIN_POST_SORTS.OLDEST ? "cũ trước" : "mới đăng trước"}`}
            isPending={list.isPending}
            isError={list.isError}
            onRetry={() => void list.refetch()}
            rowSelection={selection}
            onRowSelectionChange={setSelection}
            columnClassNames={{
              category: "max-xl:hidden",
              likes: "max-xl:hidden",
              author: "max-lg:hidden",
              createdAt: "max-md:hidden",
              actions: "w-12",
            }}
            dimRow={(post) => post.status === "ARCHIVED"}
            empty={
              <EmptyState
                icon={FileSearch}
                title={filtered ? "Không có bài nào khớp bộ lọc" : "Chưa có bài nào"}
                action={
                  filtered ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        onChange({ q: undefined, category: undefined, status: undefined });
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  ) : undefined
                }
              />
            }
            footer={
              list.data && (
                <Pagination
                  meta={list.data.meta}
                  unit="bài"
                  onPageChange={(page) => onChange({ page }, { resetPage: false })}
                  onPageSizeChange={(pageSize) => onChange({ pageSize })}
                />
              )
            }
          />
        </TabsContent>
      </Tabs>

      <HidePostDialog
        open={dialog?.kind === "hide"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          hideTargets.length === 1
            ? `Ẩn bài của ${hideTargets[0]?.author.name}?`
            : `Ẩn ${hideTargets.length} bài?`
        }
        onConfirm={async (reason) => {
          await actions.archive.mutateAsync({ ids: hideTargets.map((post) => post.id), reason });
          setSelection({});
        }}
      />
      <ConfirmDialog
        open={dialog?.kind === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          deleteTargets.length === 1 ? "Xóa hẳn bài này?" : `Xóa hẳn ${deleteTargets.length} bài?`
        }
        description="Bài bị xóa cùng bình luận, ảnh, video, không lấy lại được. Muốn giữ để xem lại thì ẩn bài thay vì xóa."
        confirmLabel={deleteTargets.length === 1 ? "Xóa bài" : `Xóa ${deleteTargets.length} bài`}
        destructive
        onConfirm={async () => {
          await actions.remove.mutateAsync(deleteTargets.map((post) => post.id));
          setSelection({});
        }}
      />
    </section>
  );
}
