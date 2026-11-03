import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@xom-nho/ui/components/card";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { Suspense } from "react";
import { BackendStatus } from "@/components/common/backend-status";

// Trang chủ tạm của giai đoạn 0: kiểm tra theme từ ui và kết nối backend. Danh sách bài làm ở giai đoạn 3.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Xóm Nhỏ</CardTitle>
          <CardDescription>Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-6 w-44" />}>
            <BackendStatus />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
