import type * as React from "react";
import { cn } from "cn";

// Khối giữ chỗ khi đang tải: ẩn với trình đọc màn hình, vùng chứa tự đặt aria-busy.
// Cùng hình dạng với nội dung thật để không xô bố cục (MASTER mục 7).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
