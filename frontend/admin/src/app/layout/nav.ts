import {
  FileText,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Shapes,
  Tag,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Số đếm cạnh mục: số bài chưa xem của màn Bài mới */
  badge?: "unseen-posts";
}

export interface NavGroup {
  /** Nhãn nhóm chữ thường 12px; rỗng với nhóm đầu (Tổng quan) */
  label: string;
  items: NavItem[];
}

/** Điều hướng của trang quản trị, theo pages/admin.md ("Bản thiết kế tham khảo", mục Layout). */
export const NAV_GROUPS: NavGroup[] = [
  { label: "", items: [{ label: "Tổng quan", to: "/", icon: LayoutDashboard }] },
  {
    label: "Kiểm duyệt",
    items: [
      { label: "Bài mới", to: "/bai-moi", icon: Inbox, badge: "unseen-posts" },
      { label: "Bài viết", to: "/bai-viet", icon: FileText },
      { label: "Bình luận", to: "/binh-luan", icon: MessageSquare },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { label: "Danh mục", to: "/danh-muc", icon: Shapes },
      { label: "Thẻ", to: "/the", icon: Tag },
    ],
  },
  { label: "Cộng đồng", items: [{ label: "Thành viên", to: "/thanh-vien", icon: Users }] },
];
