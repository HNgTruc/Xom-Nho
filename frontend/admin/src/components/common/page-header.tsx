import type { ReactNode } from "react";

/**
 * Đầu mỗi màn quản trị: tiêu đề `text-2xl` (pages/admin.md "Chữ"), một dòng mô tả `muted-foreground`, nút hành
 * động bên phải (xuống dòng trên màn hẹp). Nằm trên tấm `glass` vì chữ phụ không đặt thẳng lên khung (MASTER 2.4).
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
