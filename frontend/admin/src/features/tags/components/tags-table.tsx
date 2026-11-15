import { useQuery } from "@tanstack/react-query";
import { ADMIN_TAG_SORTS, type AdminListTagsQuery, type AdminTag, formatDate } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { Input } from "@xom-nho/ui/components/input";
import { Combine, ExternalLink, MoreHorizontal, Search, Tags, Trash2 } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Segmented } from "@/components/common/segmented";
import { EmptyState } from "@/components/common/state-message";
import { type AdminColumnDef, adminColumnHelper } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useNow } from "@/hooks/use-now";
import { WEB_URL } from "@/lib/env";
import { adminTagsListQuery } from "../api/tags.queries";
import { useTagActions } from "../hooks/use-tag-actions";
import { MergeTargetPicker } from "./merge-target-picker";

const emptyRows: AdminTag[] = [];
const numberFormat = new Intl.NumberFormat("vi-VN");
const rowButton = "size-8 max-lg:size-10";
const SORT_OPTIONS = [
  { value: ADMIN_TAG_SORTS.POSTS, label: "Nhiều bài" },
  { value: ADMIN_TAG_SORTS.NAME, label: "Tên A đến Z" },
];

/** "gỡ khỏi 3 bài" / "chưa gắn bài nào" */
function postsText(count: number): string {
  return count > 0 ? `${numberFormat.format(count)} bài` : "chưa gắn bài nào";
}

/**
 * Bảng thẻ (docs/tinh-nang.md mục 4.4): tìm theo tên, xếp theo số bài hoặc tên (dễ thấy thẻ trùng nghĩa nằm cạnh
 * nhau), menu dòng có "Gộp vào thẻ khác…", "Mở trên Xóm Nhỏ", "Xóa thẻ…". Gộp, xóa đều hỏi lại và ghi rõ bao nhiêu
 * bài bị ảnh hưởng. Bộ lọc, trang nằm trên URL.
 */
export function TagsTable({
  query,
  onChange,
}: {
  query: AdminListTagsQuery;
  onChange: (
    values: Record<string, string | number | undefined>,
    opts?: { resetPage?: boolean },
  ) => void;
}) {
  const id = useId();
  const now = useNow();
  const list = useQuery(adminTagsListQuery(query));
  const actions = useTagActions();
  const [merging, setMerging] = useState<AdminTag | null>(null);
  const [target, setTarget] = useState<AdminTag | null>(null);
  const [deleting, setDeleting] = useState<AdminTag | null>(null);

  const [search, setSearch] = useState(query.q ?? "");
  const debouncedSearch = useDebouncedValue(search);
  useEffect(() => {
    if ((query.q ?? "") !== debouncedSearch.trim())
      onChange({ q: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, query.q, onChange]);

  const columns = useMemo<AdminColumnDef<AdminTag>[]>(() => {
    const helper = adminColumnHelper<AdminTag>();
    return [
      helper.display({
        id: "name",
        header: "Thẻ",
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{row.original.name}</span>
            <span className="truncate text-xs text-muted-foreground">/tag/{row.original.slug}</span>
          </div>
        ),
      }),
      helper.display({
        id: "posts",
        header: "Số bài",
        cell: ({ row }) => (
          <span className="tabular-nums">{numberFormat.format(row.original.postCount)}</span>
        ),
      }),
      helper.display({
        id: "created",
        header: "Ngày tạo",
        cell: ({ row }) => (
          <time
            dateTime={row.original.createdAt}
            className="whitespace-nowrap text-muted-foreground"
          >
            {formatDate(row.original.createdAt, now)}
          </time>
        ),
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">Thao tác</span>,
        cell: ({ row }) => {
          const tag = row.original;
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={rowButton}
                  aria-label={`Thao tác với thẻ ${tag.name}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    setTarget(null);
                    setMerging(tag);
                  }}
                >
                  <Combine aria-hidden="true" />
                  Gộp vào thẻ khác…
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`${WEB_URL}/tag/${encodeURIComponent(tag.slug)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink aria-hidden="true" />
                    Mở trên Xóm Nhỏ
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(tag)}>
                  <Trash2 aria-hidden="true" />
                  Xóa thẻ…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ];
  }, [now]);

  const filtered = Boolean(query.q);

  return (
    <div className="flex flex-col gap-3">
      <div className="glass flex min-h-14 flex-wrap items-center gap-2 rounded-xl px-3 py-2">
        <div className="relative min-w-48 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <label htmlFor={`${id}-search`} className="sr-only">
            Tìm thẻ
          </label>
          <Input
            id={`${id}-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên thẻ"
            className="pl-9"
          />
        </div>
        <Segmented
          label="Xếp theo"
          value={query.sort}
          options={SORT_OPTIONS}
          onChange={(value) =>
            onChange({ sort: value === ADMIN_TAG_SORTS.POSTS ? undefined : value })
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={list.data?.data ?? emptyRows}
        getRowId={(tag) => tag.id}
        caption={
          query.sort === ADMIN_TAG_SORTS.NAME ? "Thẻ, xếp theo tên" : "Thẻ, gắn nhiều bài trước"
        }
        isPending={list.isPending}
        isError={list.isError}
        onRetry={() => void list.refetch()}
        columnClassNames={{
          created: "max-md:hidden",
          posts: "w-24",
          actions: "w-12 max-sm:px-1",
        }}
        empty={
          <EmptyState
            icon={Tags}
            title={filtered ? "Không có thẻ nào khớp" : "Chưa có thẻ nào"}
            description={
              filtered ? undefined : "Thẻ được tạo khi cây bút, trưởng xóm gắn thẻ mới cho bài."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    onChange({ q: undefined });
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
              unit="thẻ"
              onPageChange={(page) => onChange({ page }, { resetPage: false })}
              onPageSizeChange={(pageSize) => onChange({ pageSize })}
            />
          )
        }
      />

      <ConfirmDialog
        open={merging !== null}
        onOpenChange={(open) => !open && setMerging(null)}
        title={merging ? `Gộp thẻ “${merging.name}” vào thẻ khác?` : ""}
        description={
          merging && target
            ? `${postsText(merging.postCount)} chuyển sang “${target.name}”, thẻ “${merging.name}” bị xóa. Không hoàn tác được.`
            : `Chọn thẻ đích. Thẻ “${merging?.name ?? ""}” (${postsText(merging?.postCount ?? 0)}) sẽ bị xóa sau khi gộp.`
        }
        confirmLabel="Gộp thẻ"
        confirmDisabled={target === null}
        onConfirm={async () => {
          if (merging && target) await actions.merge.mutateAsync({ source: merging, target });
        }}
      >
        {merging && <MergeTargetPicker source={merging} value={target} onChange={setTarget} />}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `Xóa thẻ “${deleting.name}”?` : ""}
        description={
          deleting && deleting.postCount > 0
            ? `Thẻ được gỡ khỏi ${postsText(deleting.postCount)}, bài vẫn còn. Không hoàn tác được.`
            : "Thẻ này chưa gắn bài nào. Không hoàn tác được."
        }
        confirmLabel="Xóa thẻ"
        destructive
        onConfirm={async () => {
          if (deleting) await actions.remove.mutateAsync(deleting);
        }}
      />
    </div>
  );
}
