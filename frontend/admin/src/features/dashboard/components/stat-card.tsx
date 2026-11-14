import type { AdminDashboardTrend } from "@xom-nho/api";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { cn } from "@xom-nho/ui/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useCountUp } from "../hooks/use-count-up";
import { numberFormat } from "../lib/format";

/**
 * So với 7 ngày trước (pages/admin.md "Thẻ số liệu"): mũi tên kèm chữ "tăng"/"giảm" và phần trăm, nền `muted`,
 * không tô xanh đỏ (nhiều bình luận chưa hẳn là tốt).
 */
function Delta({ trend }: { trend: AdminDashboardTrend }) {
  const { current, previous } = trend;
  if (current === previous) {
    return <span className="text-muted-foreground">Bằng 7 ngày trước</span>;
  }
  // Tuần trước bằng 0 thì không có phần trăm để so: nói thẳng thay vì "tăng so với 0"
  if (previous === 0) {
    return <span className="text-muted-foreground">7 ngày trước chưa có</span>;
  }
  const up = current > previous;
  const Icon = up ? ArrowUp : ArrowDown;
  const percent = Math.round((Math.abs(current - previous) / previous) * 100);
  return (
    <>
      <span className="inline-flex h-6 items-center gap-1 rounded-md bg-muted px-2 font-medium">
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
        {up ? "tăng" : "giảm"} {percent}%
      </span>
      <span className="text-muted-foreground">so với {numberFormat.format(previous)}</span>
    </>
  );
}

/** Cột nhỏ 7 ngày gần nhất, cột hôm nay `primary`, còn lại `primary` 42%; mọc lên lần lượt. Chỉ để nhìn. */
function Spark({ values, delay }: { values: number[]; delay: number }) {
  const top = Math.max(...values, 1);
  return (
    <div aria-hidden="true" className="flex h-9 w-21 shrink-0 items-end gap-0.75 max-sm:hidden">
      {values.map((value, index) => (
        <div
          // Danh sách cố định 7 ngày, không đổi thứ tự
          key={index}
          className={cn(
            "animate-grow-y flex-1 rounded-t-[3px] rounded-b-[1px]",
            index === values.length - 1 ? "bg-primary" : "bg-primary/42",
          )}
          style={{
            height: `${Math.max((value / top) * 100, 6)}%`,
            animationDelay: `${delay + index * 45}ms`,
          }}
        />
      ))}
    </div>
  );
}

/** Thanh chia bài/bình luận đang ẩn, chạy ngang khi hiện ra. Chỉ để nhìn: số nằm trong dòng chữ bên dưới. */
function Split({ posts, comments }: { posts: number; comments: number }) {
  if (posts + comments === 0) {
    return <div aria-hidden="true" className="mt-1.5 h-2 rounded-full bg-muted" />;
  }
  return (
    <div aria-hidden="true" className="mt-1.5 flex h-2 gap-0.75">
      {posts > 0 && (
        <div
          className="animate-grow-x rounded-full bg-primary"
          style={{ flex: posts, animationDelay: "300ms" }}
        />
      )}
      {comments > 0 && (
        <div
          className="animate-grow-x rounded-full bg-primary/42"
          style={{ flex: comments, animationDelay: "380ms" }}
        />
      )}
    </div>
  );
}

/**
 * Một thẻ số liệu trên `glass-strong` (pages/admin.md): nhãn `text-sm`, số lớn `text-3xl` tabular-nums đếm từ 0 lên,
 * cột nhỏ 7 ngày hoặc thanh chia, dòng so sánh. Trình đọc màn hình đọc số cuối, không đọc số đang chạy.
 */
export function StatCard({
  label,
  value,
  trend,
  spark,
  split,
  note,
  stagger,
}: {
  label: string;
  /** `undefined`: đang tải */
  value: number | undefined;
  trend?: AdminDashboardTrend;
  spark?: number[];
  split?: { posts: number; comments: number };
  note?: ReactNode;
  /** Bậc hiện ra lần lượt (MASTER 5) */
  stagger: number;
}) {
  const display = useCountUp(value);
  return (
    <section
      aria-label={label}
      className="glass-strong animate-rise-in flex flex-col gap-1 rounded-xl p-4"
      style={{ "--stagger": stagger } as CSSProperties}
    >
      <h2 className="text-sm text-muted-foreground">{label}</h2>
      {value === undefined || display === undefined ? (
        <>
          <Skeleton className="h-9.5 w-20" />
          <Skeleton className="mt-1 h-6 w-36" />
        </>
      ) : (
        <>
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl leading-9.5 font-semibold tracking-tight tabular-nums">
              <span aria-hidden="true">{numberFormat.format(display)}</span>
              <span className="sr-only">{numberFormat.format(value)}</span>
            </p>
            {spark && <Spark values={spark} delay={120 + stagger * 40} />}
          </div>
          {split && <Split {...split} />}
          <div className="mt-1 flex min-h-6 flex-wrap items-center gap-2 text-xs tabular-nums">
            {trend && <Delta trend={trend} />}
            {note && <span className="text-muted-foreground">{note}</span>}
          </div>
        </>
      )}
    </section>
  );
}
