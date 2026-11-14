import { ComingSoon } from "@/components/common/coming-soon";

// Tổng quan cần `GET /admin/dashboard` (backend chưa làm, docs/lo-trinh.md giai đoạn 5)
export function DashboardPage() {
  return (
    <ComingSoon
      title="Tổng quan"
      description="Số liệu 7 ngày gần nhất so với 7 ngày trước đó, hoạt động 30 ngày."
    />
  );
}
