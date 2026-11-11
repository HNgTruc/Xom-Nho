import { POST_STATUS_LABELS, type PostStatus } from "@xom-nho/api";
import { Badge } from "@xom-nho/ui/components/badge";
import { Check, Clock, EyeOff, type LucideIcon, Pencil, X } from "lucide-react";

// Màu và biểu tượng theo MASTER mục 2.3: luôn có chữ, có thêm biểu tượng, không dựa vào màu đơn thuần
const STATUS_STYLE: Record<PostStatus, { className: string; icon: LucideIcon }> = {
  DRAFT: { className: "bg-status-draft-bg text-status-draft", icon: Pencil },
  PENDING: { className: "bg-status-pending-bg text-status-pending", icon: Clock },
  PUBLISHED: { className: "bg-status-published-bg text-status-published", icon: Check },
  REJECTED: { className: "bg-status-rejected-bg text-status-rejected", icon: X },
  ARCHIVED: { className: "bg-status-hidden-bg text-status-hidden", icon: EyeOff },
};

/** Badge trạng thái bài cho tác giả và trưởng xóm (skill cảnh báo "hidden post state" là anti-pattern). */
export function PostStatusBadge({ status }: { status: PostStatus }) {
  // Trạng thái lạ (backend thêm mà web chưa biết) thì hiện như bản nháp, không vỡ trang
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.DRAFT;
  const Icon = style.icon;
  return (
    <Badge variant="ghost" className={style.className}>
      <Icon aria-hidden="true" strokeWidth={1.75} />
      {POST_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
