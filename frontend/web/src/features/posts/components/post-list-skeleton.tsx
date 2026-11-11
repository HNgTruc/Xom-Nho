import { Skeleton } from "@xom-nho/ui/components/skeleton";

/** Giữ chỗ khi đang tải: cùng hình dạng thẻ bài thật để không xô bố cục (MASTER mục 7). */
export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Đang tải bài viết" className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 glass rounded-xl p-4 sm:p-5">
          <Skeleton className="h-6 w-20 rounded-sm" />
          <Skeleton className="h-7 w-3/4" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
