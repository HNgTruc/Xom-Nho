import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";

// Trang của khách (ADR 0007): cùng khung kính, header chỉ có logo, Đăng nhập, Đăng ký
export default function GuestLayout({ children }: { children: ReactNode }) {
  return <SiteShell guest>{children}</SiteShell>;
}
