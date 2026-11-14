import {
  COMMENT_STATUS_LABELS,
  type CommentStatus,
  POST_STATUS_LABELS,
  type PostStatus,
  ROLE_LABELS,
  type Role,
} from "@xom-nho/api";
import { Badge } from "@xom-nho/ui/components/badge";
import { cn } from "@xom-nho/ui/lib/utils";
import { Check, Clock, Eye, EyeOff, type LucideIcon, Pencil, X } from "lucide-react";

// Màu và biểu tượng theo MASTER mục 2.3: luôn có chữ kèm biểu tượng, không dựa vào màu đơn thuần.
// Trong bảng admin: badge chữ 12px, biểu tượng 14px (pages/admin.md "Chữ", chốt 2026-11-13).
const dense = "h-5 px-1.5 text-xs [&>svg]:size-3.5!";

const POST_STYLE: Record<PostStatus, { className: string; icon: LucideIcon }> = {
  DRAFT: { className: "bg-status-draft-bg text-status-draft", icon: Pencil },
  PENDING: { className: "bg-status-pending-bg text-status-pending", icon: Clock },
  PUBLISHED: { className: "bg-status-published-bg text-status-published", icon: Check },
  REJECTED: { className: "bg-status-rejected-bg text-status-rejected", icon: X },
  ARCHIVED: { className: "bg-status-hidden-bg text-status-hidden", icon: EyeOff },
};

/** Trạng thái bài. Trạng thái lạ (backend thêm mà admin chưa biết) hiện như bản nháp, không vỡ bảng. */
export function PostStatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  const style = POST_STYLE[status] ?? POST_STYLE.DRAFT;
  const Icon = style.icon;
  return (
    <Badge variant="ghost" className={cn(dense, style.className, className)}>
      <Icon aria-hidden="true" strokeWidth={1.75} />
      {POST_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

/** Trạng thái bình luận: đang hiện (xanh lá như "Đã đăng"), đã ẩn (xám như bài ẩn). */
export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  const hidden = status === "HIDDEN";
  const Icon = hidden ? EyeOff : Eye;
  return (
    <Badge
      variant="ghost"
      className={cn(
        dense,
        hidden
          ? "bg-status-hidden-bg text-status-hidden"
          : "bg-status-published-bg text-status-published",
      )}
    >
      <Icon aria-hidden="true" strokeWidth={1.75} />
      {COMMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

// pages/admin.md: Trưởng xóm viên `primary`, Cây bút viên `accent`, Hàng xóm viên `muted`
const ROLE_STYLE: Record<Role, string> = {
  admin: "bg-primary text-primary-foreground",
  author: "bg-accent text-accent-foreground",
  user: "bg-muted text-foreground",
};

/** Vai trò thành viên, dạng viên thuốc. */
export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge
      variant="ghost"
      className={cn(dense, "rounded-full px-2", ROLE_STYLE[role] ?? ROLE_STYLE.user)}
    >
      {ROLE_LABELS[role] ?? role}
    </Badge>
  );
}
