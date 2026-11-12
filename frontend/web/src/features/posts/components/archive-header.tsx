import { Skeleton } from "@xom-nho/ui/components/skeleton";
import type { ReactNode } from "react";

const numberFormat = new Intl.NumberFormat("vi-VN");

/**
 * Đầu trang danh mục / thẻ: nhãn nhỏ cho biết đang xem gì ("Danh mục", "Thẻ"), tên làm `h1`,
 * mô tả và số bài nếu có. `marker` nằm cạnh nhãn (chấm nhỏ), `icon` là ô biểu tượng lớn bên trái
 * (danh mục, MASTER mục 6); cả hai là trang trí, màu không phải tín hiệu duy nhất.
 * Nằm trên kính vì có chữ phụ (MASTER 2.4).
 */
export function ArchiveHeader({
  label,
  title,
  description,
  postCount,
  marker,
  icon,
}: {
  label: string;
  title: string;
  description?: string | null;
  postCount?: number;
  marker?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="glass flex animate-rise-in items-start gap-4 rounded-xl p-5 sm:gap-5 sm:p-6">
      {icon}
      <div className="flex min-w-0 flex-col gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {marker}
          {label}
        </p>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
        {postCount !== undefined && postCount > 0 && (
          <p className="text-sm text-muted-foreground">{numberFormat.format(postCount)} bài viết</p>
        )}
      </div>
    </header>
  );
}

export function ArchiveHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="glass flex flex-col gap-2 rounded-xl p-5 sm:p-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-56 max-w-full" />
      <Skeleton className="h-6 w-80 max-w-full" />
    </div>
  );
}
