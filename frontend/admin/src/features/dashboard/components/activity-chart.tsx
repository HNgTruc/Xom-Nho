import {
  ADMIN_DASHBOARD_METRIC_VALUES,
  ADMIN_DASHBOARD_METRICS,
  ADMIN_DASHBOARD_RECENT_DAYS,
  type AdminDashboardDay,
  type AdminDashboardMetric,
} from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { cn } from "@xom-nho/ui/lib/utils";
import { ChartColumn, Table2 } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { Segmented } from "@/components/common/segmented";
import { numberFormat, shortDate } from "../lib/format";

/** Tên trên nút chọn và đơn vị trong câu ("Số bình luận mỗi ngày"). */
const METRICS: Record<AdminDashboardMetric, { label: string; unit: string }> = {
  [ADMIN_DASHBOARD_METRICS.POSTS]: { label: "Bài viết", unit: "bài viết" },
  [ADMIN_DASHBOARD_METRICS.COMMENTS]: { label: "Bình luận", unit: "bình luận" },
  [ADMIN_DASHBOARD_METRICS.MEMBERS]: { label: "Thành viên", unit: "thành viên mới" },
};
const METRIC_OPTIONS = ADMIN_DASHBOARD_METRIC_VALUES.map((value) => ({
  value,
  label: METRICS[value].label,
}));

/** Mốc trên cùng của trục: 2, 4, 6, 8 hoặc 10 nhân lũy thừa của 10, để mốc giữa luôn là số nguyên. */
function niceMax(value: number): number {
  if (value <= 2) return 2;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [2, 4, 6, 8, 10].find((m) => m * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * Biểu đồ cột 30 ngày (pages/admin.md "Thẻ số liệu", đổi từ đường ngày 2026-11-13): cột mọc từ đáy lần lượt, đổi số
 * liệu thì chạy lại; 7 ngày gần nhất `primary`, trước đó `primary` 42%, có chú thích. Rê chuột vào cột hiện số;
 * cột hôm nay luôn hiện số. Nút "Xem bảng số liệu" thay biểu đồ bằng bảng cho trình đọc màn hình và người cần số
 * chính xác.
 */
export function ActivityChart({
  daily,
  metric,
  showTable,
  onChange,
}: {
  /** `undefined`: đang tải */
  daily: AdminDashboardDay[] | undefined;
  metric: AdminDashboardMetric;
  showTable: boolean;
  onChange: (values: { metric?: AdminDashboardMetric; table?: boolean }) => void;
}) {
  const current = METRICS[metric];
  const first = daily?.[0];
  const last = daily?.at(-1);
  const range = first && last ? `từ ${shortDate(first.date)} đến ${shortDate(last.date)}` : "";

  return (
    <section
      aria-labelledby="hoat-dong"
      className="glass-strong animate-rise-in flex flex-col gap-4 rounded-xl p-4 [--stagger:4]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 id="hoat-dong" className="text-base font-semibold">
            Hoạt động 30 ngày
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            Số {current.unit} mỗi ngày{range && `, ${range}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Chọn số liệu"
            value={metric}
            options={METRIC_OPTIONS}
            onChange={(value) => onChange({ metric: value })}
          />
          <Button
            variant="ghost"
            aria-pressed={showTable}
            onClick={() => onChange({ table: !showTable })}
          >
            {showTable ? <ChartColumn aria-hidden="true" /> : <Table2 aria-hidden="true" />}
            {showTable ? "Xem biểu đồ" : "Xem bảng số liệu"}
          </Button>
        </div>
      </div>

      {!daily ? (
        <Skeleton className="h-62 w-full" />
      ) : showTable ? (
        <div className="max-h-62 overflow-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm tabular-nums">
            <caption className="sr-only">Số liệu theo ngày, mới nhất trước</caption>
            <thead>
              <tr>
                {["Ngày", "Bài viết", "Bình luận", "Thành viên mới"].map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className={cn(
                      "sticky top-0 bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground",
                      index === 0 ? "text-left" : "text-right",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((day) => (
                <tr key={day.date} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 text-left font-medium">
                    {day.date === last?.date
                      ? `Hôm nay (${shortDate(day.date)})`
                      : shortDate(day.date)}
                  </th>
                  <td className="px-3 py-2 text-right">{numberFormat.format(day.posts)}</td>
                  <td className="px-3 py-2 text-right">{numberFormat.format(day.comments)}</td>
                  <td className="px-3 py-2 text-right">{numberFormat.format(day.members)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Bars
          // Đổi số liệu thì vẽ lại từ đầu để cột mọc lại (pages/admin.md)
          key={metric}
          daily={daily}
          metric={metric}
          unit={current.unit}
          range={range}
        />
      )}
    </section>
  );
}

function Bars({
  daily,
  metric,
  unit,
  range,
}: {
  daily: AdminDashboardDay[];
  metric: AdminDashboardMetric;
  unit: string;
  range: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const top = niceMax(Math.max(...daily.map((day) => day[metric])));
  const lastIndex = daily.length - 1;
  const today = daily.at(-1)?.[metric] ?? 0;
  const active = hovered ?? lastIndex;
  const recentFrom = daily.length - ADMIN_DASHBOARD_RECENT_DAYS;
  // 5 mốc ngày dưới trục: đầu, mỗi tuần, hôm nay
  const ticks = daily.filter((_, index) => index % 7 === 0 && index < lastIndex - 3);
  const lastDay = daily.at(-1);
  if (lastDay) ticks.push(lastDay);

  return (
    <div className="flex gap-2">
      <div
        aria-hidden="true"
        // Cao hơn vùng cột một dòng chữ (16px), dời lên nửa dòng: tâm nhãn trùng vạch trên, giữa, đáy
        className="flex h-54 w-8 shrink-0 -translate-y-2 flex-col items-end justify-between text-xs text-muted-foreground tabular-nums"
      >
        <span>{numberFormat.format(top)}</span>
        <span>{numberFormat.format(top / 2)}</span>
        <span>0</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Cột chỉ để nhìn; trình đọc màn hình đọc câu tóm tắt này, số từng ngày ở chế độ bảng */}
        <p className="sr-only">
          Biểu đồ cột: số {unit} mỗi ngày {range}, hôm nay {numberFormat.format(today)}. Xem số từng
          ngày bằng nút Xem bảng số liệu.
        </p>
        <div
          aria-hidden="true"
          onPointerLeave={() => setHovered(null)}
          className="relative flex h-50 items-stretch gap-0.5 border-b border-border sm:gap-1"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 border-t border-dashed border-border"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 border-t border-dashed border-border"
          />
          {daily.map((day, index) => {
            const value = day[metric];
            const height = `${(value / top) * 100}%`;
            const nearEnd = index >= daily.length - 4;
            const nearStart = index <= 3;
            return (
              <div
                key={day.date}
                onPointerEnter={() => setHovered(index)}
                className="relative flex min-w-0 flex-1 items-end"
              >
                <div
                  className={cn(
                    "animate-grow-y w-full rounded-t-md rounded-b-xs transition-opacity duration-120",
                    index >= recentFrom ? "bg-primary" : "bg-primary/42",
                    hovered === index && "opacity-80",
                  )}
                  style={{ height, animationDelay: `${index * 10}ms` }}
                />
                {active === index && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute z-10 rounded-lg bg-primary px-2 py-1 text-xs font-semibold whitespace-nowrap text-primary-foreground tabular-nums"
                    style={
                      {
                        bottom: `calc(${height} + 8px)`,
                        left: nearEnd ? "100%" : nearStart ? "0" : "50%",
                        transform: `translateX(${nearEnd ? "-100%" : nearStart ? "0" : "-50%"})`,
                      } as CSSProperties
                    }
                  >
                    {index === lastIndex
                      ? `Hôm nay · ${numberFormat.format(value)} ${unit}`
                      : `${shortDate(day.date)}: ${numberFormat.format(value)}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className="flex justify-between text-xs text-muted-foreground tabular-nums"
        >
          {ticks.map((day) => (
            <span key={day.date}>{shortDate(day.date)}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-[3px] bg-primary" />
            {ADMIN_DASHBOARD_RECENT_DAYS} ngày gần nhất
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-[3px] bg-primary/42" />
            {daily.length - ADMIN_DASHBOARD_RECENT_DAYS} ngày trước đó
          </span>
        </div>
      </div>
    </div>
  );
}
