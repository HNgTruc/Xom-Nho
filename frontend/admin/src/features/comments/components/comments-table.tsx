import { useQuery } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  type AdminCommentListItem,
  type AdminListCommentsQuery,
  COMMENT_STATUS_LABELS,
  formatDateTime,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@xom-nho/ui/components/tabs";
import {
  CornerDownRight,
  Eye,
  EyeOff,
  MessageSquareOff,
  MoreHorizontal,
  Search,
  SquareArrowOutUpRight,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { AuthorCell } from "@/components/common/author-cell";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/state-message";
import { CommentStatusBadge } from "@/components/common/status-badge";
import {
  type AdminColumnDef,
  adminColumnHelper,
  selectColumn,
} from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useNow } from "@/hooks/use-now";
import { WEB_URL } from "@/lib/env";
import { adminCommentsListQuery } from "../api/comments.queries";
import { useCommentActions } from "../hooks/use-comment-actions";

const ALL = "ALL";
const emptyRows: AdminCommentListItem[] = [];
const rowButton = "size-8 max-lg:size-10";
const postHref = (comment: AdminCommentListItem) =>
  `${WEB_URL}/bai-viet/${comment.post.slug}#binh-luan`;

/**
 * Bảng bình luận (docs/tinh-nang.md mục 4.3: ẩn / hiện, xem bài gốc; pages/admin.md "Bảng dữ liệu"): tab trạng thái,
 * tìm trong nội dung, chọn nhiều để ẩn, hiện lại, xóa; menu từng dòng mở bài gốc ở khối bình luận. Bình luận đã ẩn
 * mờ 60%. Nội dung hiện dạng chữ (không render HTML), tối đa 3 dòng.
 */
export function CommentsTable({
  query,
  onChange,
}: {
  query: AdminListCommentsQuery;
  onChange: (
    values: Partial<Record<keyof AdminListCommentsQuery, string | number | undefined>>,
    opts?: { resetPage?: boolean },
  ) => void;
}) {
  const id = useId();
  const now = useNow();
  const list = useQuery(adminCommentsListQuery(query));
  const actions = useCommentActions();
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [toDelete, setToDelete] = useState<AdminCommentListItem[] | null>(null);

  const [search, setSearch] = useState(query.q ?? "");
  const debouncedSearch = useDebouncedValue(search);
  useEffect(() => {
    if ((query.q ?? "") !== debouncedSearch.trim())
      onChange({ q: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, query.q, onChange]);

  // Đổi trang, bộ lọc thì bỏ chọn (dòng đã chọn không còn trên màn hình); giữ selection theo khóa query
  const queryKey = JSON.stringify(query);
  const [selectionKey, setSelectionKey] = useState(queryKey);
  if (selectionKey !== queryKey) {
    setSelectionKey(queryKey);
    setSelection({});
  }

  const rows = list.data?.data ?? emptyRows;
  const selected = rows.filter((comment) => selection[comment.id]);
  const selectedVisible = selected.filter((comment) => comment.status === "VISIBLE");
  const selectedHidden = selected.filter((comment) => comment.status === "HIDDEN");

  const columns = useMemo<AdminColumnDef<AdminCommentListItem>[]>(() => {
    const helper = adminColumnHelper<AdminCommentListItem>();
    return [
      selectColumn<AdminCommentListItem>((comment) => `Chọn bình luận của ${comment.author.name}`),
      helper.display({
        id: "content",
        header: "Bình luận",
        cell: ({ row }) => (
          <div className="flex max-w-md min-w-0 items-start gap-1.5 md:min-w-56">
            {row.original.parentId && (
              <CornerDownRight
                aria-label="Trả lời"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
            )}
            <p className="line-clamp-3 whitespace-pre-line">{row.original.content}</p>
          </div>
        ),
      }),
      helper.display({
        id: "author",
        header: "Người viết",
        cell: ({ row }) => <AuthorCell author={row.original.author} />,
      }),
      helper.display({
        id: "post",
        header: "Bài",
        cell: ({ row }) => (
          <a
            href={postHref(row.original)}
            target="_blank"
            rel="noopener"
            className="line-clamp-2 max-w-56 rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {row.original.post.title || row.original.post.excerpt || "Bài chỉ có ảnh, video"}
            <span className="sr-only"> (mở bài gốc, thẻ mới)</span>
          </a>
        ),
      }),
      helper.display({
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => <CommentStatusBadge status={row.original.status} />,
      }),
      helper.display({
        id: "createdAt",
        header: "Lúc",
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
          const comment = row.original;
          const hidden = comment.status === "HIDDEN";
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={rowButton}
                  aria-label={`Thao tác với bình luận của ${comment.author.name}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={postHref(comment)} target="_blank" rel="noopener">
                    <SquareArrowOutUpRight aria-hidden="true" />
                    Mở bài gốc
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    hidden ? actions.show.mutate([comment.id]) : actions.hide.mutate([comment.id])
                  }
                >
                  {hidden ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                  {hidden ? "Hiện lại" : "Ẩn"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setToDelete([comment])}>
                  <Trash2 aria-hidden="true" />
                  Xóa…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ];
  }, [now, actions.hide, actions.show]);

  const activeTab = query.status ?? ALL;
  const filtered = Boolean(query.q || query.status);
  const tabs = [
    { value: ALL, label: "Tất cả" },
    { value: "VISIBLE", label: COMMENT_STATUS_LABELS.VISIBLE },
    { value: "HIDDEN", label: COMMENT_STATUS_LABELS.HIDDEN },
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onChange({ status: value === ALL ? undefined : value })}
    >
      <TabsList aria-label="Lọc theo trạng thái">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="flex flex-col gap-3">
        {selected.length > 0 ? (
          <div className="glass flex min-h-14 flex-wrap items-center gap-2 rounded-xl px-3 py-2">
            <span
              className="glass-primary rounded-full px-3 py-1 text-sm font-medium"
              aria-live="polite"
            >
              Đã chọn {selected.length} bình luận
            </span>
            {selectedVisible.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.hide.mutate(selectedVisible.map((c) => c.id))}
              >
                <EyeOff aria-hidden="true" />
                Ẩn
              </Button>
            )}
            {selectedHidden.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => actions.show.mutate(selectedHidden.map((c) => c.id))}
              >
                <Eye aria-hidden="true" />
                Hiện lại
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setToDelete(selected)}>
              <Trash2 aria-hidden="true" />
              Xóa…
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelection({})}>
              <X aria-hidden="true" />
              Bỏ chọn
            </Button>
          </div>
        ) : (
          <div className="glass flex min-h-14 items-center gap-2 rounded-xl px-3 py-2">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor={`${id}-search`} className="sr-only">
                Tìm bình luận
              </label>
              <Input
                id={`${id}-search`}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm trong nội dung bình luận"
                className="pl-9"
              />
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={rows}
          getRowId={(comment) => comment.id}
          caption="Bình luận, mới nhất trước"
          isPending={list.isPending}
          isError={list.isError}
          onRetry={() => void list.refetch()}
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          columnClassNames={{
            post: "max-xl:hidden",
            author: "max-lg:hidden",
            createdAt: "max-md:hidden",
            actions: "w-12",
          }}
          dimRow={(comment) => comment.status === "HIDDEN"}
          empty={
            <EmptyState
              icon={MessageSquareOff}
              title={filtered ? "Không có bình luận nào khớp bộ lọc" : "Chưa có bình luận nào"}
              action={
                filtered ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      onChange({ q: undefined, status: undefined });
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
                unit="bình luận"
                onPageChange={(page) => onChange({ page }, { resetPage: false })}
                onPageSizeChange={(pageSize) => onChange({ pageSize })}
              />
            )
          }
        />
      </TabsContent>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={
          toDelete?.length === 1
            ? "Xóa hẳn bình luận này?"
            : `Xóa hẳn ${toDelete?.length ?? 0} bình luận?`
        }
        description="Bình luận và các trả lời bên dưới bị xóa hẳn, không lấy lại được. Muốn giữ để xem lại thì ẩn thay vì xóa."
        confirmLabel="Xóa bình luận"
        destructive
        onConfirm={async () => {
          await actions.remove.mutateAsync((toDelete ?? []).map((comment) => comment.id));
          setSelection({});
        }}
      />
    </Tabs>
  );
}
