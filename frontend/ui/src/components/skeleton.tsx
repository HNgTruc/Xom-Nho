import type * as React from "react";
import { cn } from "cn";

// Khối giữ chỗ khi đang tải: ẩn với trình đọc màn hình, vùng chứa tự đặt aria-busy.
// Cùng hình dạng với nội dung thật để không xô bố cục (MASTER mục 7). Tắt nhấp nháy khi người dùng
// chọn giảm chuyển động (MASTER mục 5).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
