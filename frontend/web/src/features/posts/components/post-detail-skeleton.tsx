import { Skeleton } from "@xom-nho/ui/components/skeleton";

/** Giữ chỗ trang bài viết: cùng bố cục (badge, tiêu đề 2 dòng, hàng tác giả, các đoạn văn). */
export function PostDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải bài viết" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-20 rounded-sm" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
      <div className="flex max-w-[68ch] flex-col gap-3">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className={index % 4 === 3 ? "h-7 w-1/2" : "h-7 w-full"} />
        ))}
      </div>
    </div>
  );
}
