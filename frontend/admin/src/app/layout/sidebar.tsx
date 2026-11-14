import { LogoMark } from "@xom-nho/ui/components/logo-mark";
import { Tooltip, TooltipContent, TooltipTrigger } from "@xom-nho/ui/components/tooltip";
import { cn } from "@xom-nho/ui/lib/utils";
import { ExternalLink, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { useSignOut } from "@/features/auth";
import { UnseenCount } from "@/features/moderation";
import { WEB_URL } from "@/lib/env";
import { NAV_GROUPS } from "./nav";

/** Mục điều hướng: viên thuốc cao 40px, mục đang chọn là `glass-primary` (MASTER 2.4). */
const itemClass =
  "relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-sm font-medium text-foreground transition-colors duration-120 outline-none hover:bg-glass-button-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:size-5 [&_svg]:shrink-0";

const activeClass =
  "aria-[current=page]:glass-primary aria-[current=page]:text-primary-foreground aria-[current=page]:hover:bg-glass-primary-hover";

/** Thu gọn (64px, chỉ biểu tượng) thì tên mục hiện ở tooltip; trình đọc màn hình vẫn đọc tên (`sr-only`). */
function WithTooltip({
  collapsed,
  label,
  children,
}: {
  collapsed: boolean;
  label: string;
  children: ReactNode;
}) {
  if (!collapsed) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Sidebar trang quản trị (pages/admin.md "Bố cục", "Bản thiết kế tham khảo"): tấm `glass` bo radius-xl, viên logo
 * kèm viên "Quản trị", nhóm điều hướng có nhãn chữ thường 12px, cuối là "Mở Xóm Nhỏ" và "Đăng xuất". Rộng 240px,
 * thu gọn 64px. Dưới 1024px nằm trong ngăn kéo (`AdminLayout`), luôn đủ chữ; chọn một mục thì đóng ngăn kéo.
 */
export function Sidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const signOut = useSignOut();
  const label = (text: string) => <span className={cn(collapsed && "sr-only")}>{text}</span>;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "px-1")}>
        <span className="inline-flex h-10 items-center gap-2 rounded-full border border-input/50 px-2.5 text-base font-bold tracking-tight">
          <LogoMark className="size-6" />
          {label("Xóm Nhỏ")}
        </span>
        {!collapsed && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            Quản trị
          </span>
        )}
      </div>

      <nav
        aria-label="Trang quản trị"
        className="-mx-1 flex flex-1 flex-col gap-4 overflow-y-auto px-1"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label || "chinh"} className="flex flex-col gap-1">
            {group.label && !collapsed && (
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{group.label}</p>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <WithTooltip collapsed={collapsed} label={item.label}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={onNavigate}
                      // Chuỗi tĩnh, không dùng `className` dạng hàm của NavLink: khi thu gọn, TooltipTrigger
                      // (`asChild`, Radix Slot) gộp className theo chuỗi nên hàm bị mất. Mục đang mở có
                      // `aria-current="page"` (NavLink tự gắn), tô theo đó; selector có thuộc tính nên chữ
                      // `primary-foreground` không bị `text-foreground` đè
                      className={cn(itemClass, collapsed && "justify-center px-0", activeClass)}
                    >
                      <item.icon aria-hidden="true" />
                      {label(item.label)}
                      {item.badge === "unseen-posts" && <UnseenCount collapsed={collapsed} />}
                    </NavLink>
                  </WithTooltip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <WithTooltip collapsed={collapsed} label="Mở Xóm Nhỏ">
          <a
            href={WEB_URL}
            target="_blank"
            rel="noopener"
            className={cn(itemClass, collapsed && "justify-center px-0")}
          >
            <ExternalLink aria-hidden="true" />
            {label("Mở Xóm Nhỏ")}
            <span className="sr-only"> (mở thẻ mới)</span>
          </a>
        </WithTooltip>
        <WithTooltip collapsed={collapsed} label="Đăng xuất">
          <button
            type="button"
            onClick={() => void signOut.run()}
            disabled={signOut.pending}
            className={cn(itemClass, collapsed && "justify-center px-0", "disabled:opacity-50")}
          >
            <LogOut aria-hidden="true" />
            {label("Đăng xuất")}
          </button>
        </WithTooltip>
      </div>
    </div>
  );
}
