import { Skeleton } from "@xom-nho/ui/components/skeleton";

// Giữ đúng khung form đăng nhập/đăng ký để không xô bố cục khi trang tải xong
export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
