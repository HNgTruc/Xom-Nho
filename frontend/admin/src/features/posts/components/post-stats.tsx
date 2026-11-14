import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_STATS_RANGES,
  type AdminPostListItem,
  type AdminPostSort,
  type AdminStatsRange,
  SORT_ORDERS,
  type SortOrder,
} from "@xom-nho/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@xom-nho/ui/components/select";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { ArrowDown, ArrowUp, Trophy } from "lucide-react";
import { useId, useMemo } from "react";
import { Segmented } from "@/components/common/segmented";
import { EmptyState } from "@/components/common/state-message";
import {
  type AdminColumnDef,
  adminColumnHelper,
  type SortValue,
} from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { SortHeader } from "@/components/data-table/sort-header";
import { adminPostStatsQuery, adminPostsListQuery } from "../api/posts.queries";
import { AuthorCell, PostTitleCell } from "./post-cells";

const numberFormat = new Intl.NumberFormat("vi-VN");
const RANGE_OPTIONS: { value: AdminStatsRange; label: string }[] = [
  { value: ADMIN_STATS_RANGES.WEEK, label: "7 ngày" },
  { value: ADMIN_STATS_RANGES.MONTH, label: "30 ngày" },
  { value: ADMIN_STATS_RANGES.ALL, label: "Tất cả" },
];
const RANGE_TEXT: Record<AdminStatsRange, string> = {
  "7d": "trong 7 ngày",
  "30d": "trong 30 ngày",
  all: "từ trước tới nay",
};
export type RankSort = Extract<AdminPostSort, "likes" | "dislikes" | "comments" | "views">;
const RANK_SIZES = [20, 30];
const RANK_OPTIONS: {
  value: RankSort;
  label: string;
  pick: (post: AdminPostListItem) => number;
}[] = [
  { value: "likes", label: "Thích", pick: (post) => post.likeCount },
  { value: "dislikes", label: "Không thích", pick: (post) => post.dislikeCount },
  { value: "comments", label: "Bình luận", pick: (post) => post.commentCount },
  { value: "views", label: "Lượt xem", pick: (post) => post.viewCount },
];
const emptyRows: AdminPostListItem[] = [];

/** So với khoảng trước (pages/admin.md "Thẻ số liệu"): mũi tên kèm chữ "tăng"/"giảm", không tô xanh đỏ. */
function Delta({ total, previous }: { total: number; previous: number | null }) {
  if (previous === null) return null;
  if (total === previous) {
    return (
      <p className="text-sm text-muted-foreground">
        Bằng khoảng trước ({numberFormat.format(previous)})
      </p>
    );
  }
  // Khoảng trước không có bài: không có phần trăm để so, nói thẳng thay vì "tăng so với 0"
  if (previous === 0) {
    return <p className="text-sm text-muted-foreground">Khoảng trước chưa có bài nào</p>;
  }
  const up = total > previous;
  const Icon = up ? ArrowUp : ArrowDown;
  const percent = Math.round((Math.abs(total - previous) / previous) * 100);
  return (
    <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Icon aria-hidden="true" className="size-4" />
      {up ? "tăng" : "giảm"} {percent}% so với {numberFormat.format(previous)} bài khoảng trước
    </p>
  );
}

/**
 * Thống kê màn Bài viết (pages/admin.md "Thống kê ở màn Bài viết", chốt 2026-11-13): chọn khoảng 7 ngày, 30 ngày,
 * tất cả; số bài đăng trong khoảng so với khoảng trước; bảng xếp hạng 20 bài (chọn được 30) theo một cột Thích,
 * Không thích, Bình luận, Lượt xem, cao xuống thấp, bấm lại tiêu đề cột để đảo chiều. Trạng thái nằm trên URL.
 */
export function PostStats({
  range,
  sort,
  order,
  size,
  onChange,
}: {
  range: AdminStatsRange;
  sort: RankSort;
  order: SortOrder;
  size: number;
  onChange: (values: {
    range?: AdminStatsRange;
    rsort?: RankSort;
    rorder?: SortOrder;
    rsize?: number;
  }) => void;
}) {
  const id = useId();
  const stats = useQuery(adminPostStatsQuery(range));
  const ranking = useQuery(adminPostsListQuery({ range, sort, order, pageSize: size, page: 1 }));
  const sortValue: SortValue = { key: sort, order };

  const columns = useMemo<AdminColumnDef<AdminPostListItem>[]>(() => {
    const helper = adminColumnHelper<AdminPostListItem>();
    const current: SortValue = { key: sort, order };
    const onSort = (value: SortValue) =>
      onChange({ rsort: value.key as RankSort, rorder: value.order });
    const metric = (key: RankSort, label: string, pick: (post: AdminPostListItem) => number) =>
      helper.display({
        id: key,
        header: () => <SortHeader label={label} sortKey={key} sort={current} onSort={onSort} />,
        cell: ({ row }) => (
          <span className="tabular-nums">{numberFormat.format(pick(row.original))}</span>
        ),
      });
    return [
      helper.display({
        id: "rank",
        header: () => <span className="sr-only">Hạng</span>,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">{row.index + 1}</span>
        ),
      }),
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
      ...RANK_OPTIONS.map((option) => metric(option.value, option.label, option.pick)),
    ];
  }, [sort, order, onChange]);

  const data = stats.data;

  return (
    <section aria-labelledby="thong-ke" className="flex flex-col gap-3">
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 id="thong-ke" className="text-lg font-semibold">
            Thống kê
          </h2>
          {data ? (
            <>
              <p className="text-3xl font-semibold tabular-nums">
                {numberFormat.format(data.total)}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  bài đăng {RANGE_TEXT[range]}
                </span>
              </p>
              <Delta total={data.total} previous={data.previousTotal} />
            </>
          ) : stats.isError ? (
            <p className="text-sm text-destructive">Chưa tải được số liệu.</p>
          ) : (
            <Skeleton className="h-9 w-56" />
          )}
        </div>
        <Segmented
          label="Khoảng thời gian"
          value={range}
          options={RANGE_OPTIONS}
          onChange={(value) => onChange({ range: value })}
        />
      </div>

      <DataTable
        columns={columns}
        data={ranking.data?.data ?? emptyRows}
        getRowId={(post) => post.id}
        caption={`Bài nhiều tương tác nhất ${RANGE_TEXT[range]}, xếp theo cột đã chọn`}
        isPending={ranking.isPending}
        isError={ranking.isError}
        onRetry={() => void ranking.refetch()}
        sort={sortValue}
        // Dưới 768px chỉ còn tên bài và cột đang xếp (đổi cột bằng ô "Xếp theo" bên dưới): ẩn cố định một cột thì
        // xếp theo đúng cột đó là mất số
        columnClassNames={{
          author: "max-lg:hidden",
          ...Object.fromEntries(
            RANK_OPTIONS.filter((option) => option.value !== sort).map((option) => [
              option.value,
              "max-md:hidden",
            ]),
          ),
        }}
        dimRow={(post) => post.status === "ARCHIVED"}
        empty={<EmptyState icon={Trophy} title={`Chưa có bài nào ${RANGE_TEXT[range]}`} />}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3 text-sm">
            <p className="text-muted-foreground max-md:hidden">
              Xếp hạng {size} bài, bấm tiêu đề cột để đổi cách xếp hoặc đảo chiều.
            </p>
            <div className="flex items-center gap-2 md:hidden">
              <label htmlFor={`${id}-rank-sort`} className="text-muted-foreground">
                Xếp theo
              </label>
              <Select
                value={sort}
                onValueChange={(value) =>
                  onChange({ rsort: value as RankSort, rorder: SORT_ORDERS.DESC })
                }
              >
                <SelectTrigger id={`${id}-rank-sort`} className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Segmented
              label="Số bài xếp hạng"
              value={size}
              options={RANK_SIZES.map((value) => ({ value, label: `${value} bài` }))}
              onChange={(value) => onChange({ rsize: value })}
            />
          </div>
        }
      />
    </section>
  );
}
