import { Construction } from "lucide-react";
import { PageHeader } from "./page-header";
import { EmptyState } from "./state-message";

/**
 * Màn chưa làm (giai đoạn 5 làm theo đợt, docs/lo-trinh.md). Giữ mục trên sidebar để thấy đủ bố cục, nhưng nói rõ
 * là chưa có thay vì để trang trống.
 */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3">
      <PageHeader title={title} description={description} />
      <div className="glass rounded-xl">
        <EmptyState
          icon={Construction}
          title="Màn này đang làm"
          description="Sẽ có ở các đợt tiếp theo của giai đoạn 5."
        />
      </div>
    </div>
  );
}
