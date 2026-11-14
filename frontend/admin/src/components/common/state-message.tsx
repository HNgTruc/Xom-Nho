import { Button } from "@xom-nho/ui/components/button";
import { CircleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Trạng thái trống của bảng, màn (MASTER "Trạng thái màn hình", pages/admin.md: "Không có bài nào khớp bộ lọc" +
 * "Xóa bộ lọc"): biểu tượng 24px, một câu chính, một câu phụ, nút hành động nếu có.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Icon aria-hidden="true" className="size-6 text-muted-foreground" strokeWidth={1.75} />
      <p className="text-base font-medium">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Lỗi tải dữ liệu: nói chuyện gì xảy ra và cho thử lại (giong-van: không hiện mã lỗi kỹ thuật). */
export function ErrorState({
  message = "Chưa tải được dữ liệu. Bạn thử lại nhé.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <CircleAlert aria-hidden="true" className="size-6 text-destructive" strokeWidth={1.75} />
      <p className="text-base">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
