import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_DASHBOARD_METRIC_VALUES,
  ADMIN_DASHBOARD_METRICS,
  ADMIN_DASHBOARD_RECENT_DAYS,
  type AdminDashboard,
  type AdminDashboardMetric,
} from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/state-message";
import { useUrlState } from "@/hooks/use-url-state";
import { dashboardQuery } from "../api/dashboard.queries";
import { ActivityChart } from "../components/activity-chart";
import { NewMembersCard, UnseenPostsCard } from "../components/recent-lists";
import { StatCard } from "../components/stat-card";
import { numberFormat } from "../lib/format";

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

function isMetric(value: string | undefined): value is AdminDashboardMetric {
  return (ADMIN_DASHBOARD_METRIC_VALUES as readonly string[]).includes(value ?? "");
}

/** 7 cột nhỏ của thẻ số liệu: 7 ngày cuối của chuỗi 30 ngày. */
function spark(data: AdminDashboard | undefined, metric: AdminDashboardMetric) {
  return data?.daily.slice(-ADMIN_DASHBOARD_RECENT_DAYS).map((day) => day[metric]);
}

function hiddenNote(hidden: AdminDashboard["hidden"]): string {
  if (hidden.posts + hidden.comments === 0) return "Không có bài viết, bình luận nào đang ẩn";
  return `${numberFormat.format(hidden.posts)} bài viết và ${numberFormat.format(hidden.comments)} bình luận đang ẩn`;
}

/**
 * Màn Tổng quan (docs/tinh-nang.md mục 4.1, pages/admin.md "Thẻ số liệu"): 4 thẻ số liệu (bài, bình luận, thành
 * viên mới trong 7 ngày so với 7 ngày trước; số đang ẩn), biểu đồ cột 30 ngày, bài mới chưa xem và thành viên mới.
 * Số liệu chọn trên biểu đồ và chế độ bảng nằm trên URL.
 */
export function DashboardPage() {
  const { params, set } = useUrlState();
  const query = useQuery(dashboardQuery);
  const data = query.data;
  const metric = isMetric(params.metric) ? params.metric : ADMIN_DASHBOARD_METRICS.POSTS;
  const showTable = params.table === "1";

  const updated = data ? ` · Cập nhật lúc ${timeFormat.format(new Date(data.generatedAt))}` : "";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tổng quan"
        description={`${ADMIN_DASHBOARD_RECENT_DAYS} ngày gần nhất so với ${ADMIN_DASHBOARD_RECENT_DAYS} ngày trước đó${updated}`}
        actions={
          <Button
            variant="outline"
            loading={query.isFetching && !query.isPending}
            onClick={() => void query.refetch()}
          >
            <RefreshCw aria-hidden="true" />
            Làm mới
          </Button>
        }
      />

      {query.isError && !data ? (
        <div className="glass-strong rounded-xl">
          <ErrorState
            message="Chưa tải được số liệu. Bạn thử lại nhé."
            onRetry={() => void query.refetch()}
          />
        </div>
      ) : (
        <>
          {/* 2 cột trên màn hẹp (4 thẻ chồng một cột đẩy biểu đồ xuống quá sâu), 4 cột từ 1280px */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Bài viết mới"
              value={data?.recent.posts.current}
              trend={data?.recent.posts}
              spark={spark(data, "posts")}
              stagger={0}
            />
            <StatCard
              label="Bình luận mới"
              value={data?.recent.comments.current}
              trend={data?.recent.comments}
              spark={spark(data, "comments")}
              stagger={1}
            />
            <StatCard
              label="Thành viên mới"
              value={data?.recent.members.current}
              trend={data?.recent.members}
              spark={spark(data, "members")}
              stagger={2}
            />
            <StatCard
              label="Đang ẩn"
              value={data ? data.hidden.posts + data.hidden.comments : undefined}
              split={data?.hidden}
              note={data && hiddenNote(data.hidden)}
              stagger={3}
            />
          </div>

          <ActivityChart
            daily={data?.daily}
            metric={metric}
            showTable={showTable}
            onChange={(values) =>
              set(
                {
                  ...(values.metric && {
                    metric:
                      values.metric === ADMIN_DASHBOARD_METRICS.POSTS ? undefined : values.metric,
                  }),
                  ...(values.table !== undefined && { table: values.table ? 1 : undefined }),
                },
                { resetPage: false },
              )
            }
          />
        </>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,27.5rem),1fr))] gap-4">
        <UnseenPostsCard stagger={5} />
        <NewMembersCard stagger={6} />
      </div>
    </div>
  );
}
