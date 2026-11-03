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
import { getCurrentUser } from "@/features/auth";

async function Greeting() {
  // Backend không trả lời thì chào như khách; khối BackendStatus bên dưới đã báo lỗi kết nối
  const user = await getCurrentUser().catch(() => null);
  return (
    <CardDescription>
      {user
        ? `Chào ${user.name}, hôm nay xóm có gì mới nè.`
        : "Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện."}
    </CardDescription>
  );
}

// Trang chủ tạm: lời chào theo người đăng nhập, kiểm tra kết nối backend. Danh sách bài làm ở giai đoạn 3.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Xóm Nhỏ</CardTitle>
          <Suspense fallback={<Skeleton className="h-6 w-72" />}>
            <Greeting />
          </Suspense>
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
