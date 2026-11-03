import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@xom-nho/ui/components/card";
import { BackendStatus } from "@/components/common/backend-status";
import { meQuery, SignOutButton } from "@/features/auth";

// Trang tạm: kiểm tra đăng nhập, theme và kết nối backend. Số liệu tổng quan làm ở giai đoạn 5.
export function DashboardPage() {
  const { data: me } = useQuery(meQuery);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quản trị Xóm Nhỏ</CardTitle>
          <CardDescription>
            Đang đăng nhập: {me?.name}. Trang tổng quan sẽ có ở giai đoạn 5.
          </CardDescription>
          <CardAction>
            <SignOutButton />
          </CardAction>
        </CardHeader>
        <CardContent>
          <BackendStatus />
        </CardContent>
      </Card>
    </main>
  );
}
