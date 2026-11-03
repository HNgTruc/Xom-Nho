import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@xom-nho/ui/components/card";
import { BackendStatus } from "@/components/common/backend-status";

// Trang tạm của giai đoạn 0: kiểm tra theme và kết nối backend. Số liệu tổng quan làm ở giai đoạn 5.
export function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Quản trị Xóm Nhỏ</CardTitle>
          <CardDescription>Trang tổng quan sẽ có ở giai đoạn 5.</CardDescription>
        </CardHeader>
        <CardContent>
          <BackendStatus />
        </CardContent>
      </Card>
    </main>
  );
}
