import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";

// Trang cần đăng nhập (cài đặt, viết bài, bài của tôi): cùng khung kính và header như trang công khai
export default function AuthorLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
