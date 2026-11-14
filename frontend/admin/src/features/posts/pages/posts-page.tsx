import {
  ADMIN_STATS_RANGES,
  type AdminListPostsQuery,
  type AdminStatsRange,
  adminListPostsQuerySchema,
  adminPostStatsQuerySchema,
  SORT_ORDERS,
  type SortOrder,
} from "@xom-nho/api";
import { useCallback } from "react";
import { PageHeader } from "@/components/common/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import { PostStats, type RankSort } from "../components/post-stats";
import { PostsTable } from "../components/posts-table";

const RANK_SORTS: RankSort[] = ["likes", "dislikes", "comments", "views"];
const DEFAULT_LIST = adminListPostsQuerySchema.parse({});

/** Đọc bảng mọi bài từ URL; giá trị sai (sửa tay URL) thì về mặc định thay vì vỡ trang. */
function parseList(params: Record<string, string>): AdminListPostsQuery {
  const { status, category, q, sort, page, pageSize } = params;
  const result = adminListPostsQuerySchema.safeParse({ status, category, q, sort, page, pageSize });
  return result.success ? result.data : DEFAULT_LIST;
}

/**
 * Màn Bài viết (pages/admin.md, canvas "Bài viết"; docs/tinh-nang.md mục 4.3): thống kê + bảng xếp hạng, rồi bảng
 * mọi bài. Trạng thái của cả hai nằm trên URL: `range`, `rsort`, `rorder`, `rsize` cho thống kê; `status`, `q`,
 * `category`, `sort`, `page`, `pageSize` cho bảng.
 */
export function PostsPage() {
  const { params, set } = useUrlState();

  const rangeResult = adminPostStatsQuerySchema.safeParse({ range: params.range });
  const range: AdminStatsRange = rangeResult.success
    ? rangeResult.data.range
    : ADMIN_STATS_RANGES.MONTH;
  const rsort = RANK_SORTS.includes(params.rsort as RankSort)
    ? (params.rsort as RankSort)
    : "likes";
  const rorder: SortOrder = params.rorder === SORT_ORDERS.ASC ? SORT_ORDERS.ASC : SORT_ORDERS.DESC;
  const rsize = params.rsize === "30" ? 30 : 20;

  // Đổi thống kê không đụng tới trang của bảng mọi bài
  const changeStats = useCallback(
    (values: Record<string, string | number | undefined>) => set(values, { resetPage: false }),
    [set],
  );

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Bài viết"
        description="Mọi bài trong xóm, kể cả bài đang ẩn; thống kê và xếp hạng theo tương tác."
      />
      <PostStats range={range} sort={rsort} order={rorder} size={rsize} onChange={changeStats} />
      <PostsTable query={parseList(params)} onChange={set} />
    </div>
  );
}
