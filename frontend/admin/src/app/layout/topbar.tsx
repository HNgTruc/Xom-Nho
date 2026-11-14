import { useQuery } from "@tanstack/react-query";
import { avatarUrl } from "@xom-nho/api/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Button } from "@xom-nho/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { useDisplayPreferences } from "@xom-nho/ui/hooks/use-display-preferences";
import { LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { meQuery, useSignOut } from "@/features/auth";
import { API_URL } from "@/lib/env";

/** Chế độ tối đang hiện (class `dark` trên `<html>`, do tùy chọn hiển thị đặt), theo dõi để đổi biểu tượng nút. */
function useIsDark(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  return (words.at(-1)?.[0] ?? "?").toUpperCase();
}

/**
 * Topbar trang quản trị (pages/admin.md "Bản thiết kế tham khảo"): viên thuốc `glass` cao 56px. Trái: nút mở ngăn
 * kéo (dưới 1024px) hoặc nút thu gọn sidebar. Phải: chế độ tối, menu tài khoản (giảm trong suốt, đăng xuất).
 * Ô tìm toàn trang (phím `/`) chưa làm: backend chưa có tìm chung cho admin.
 */
export function Topbar({
  collapsed,
  onToggleCollapsed,
  onOpenDrawer,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenDrawer: () => void;
}) {
  const { data: me } = useQuery(meQuery);
  const { preferences, update } = useDisplayPreferences();
  const dark = useIsDark();
  const signOut = useSignOut();

  return (
    <header className="glass flex h-14 items-center gap-2 rounded-full px-2">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Mở điều hướng"
        onClick={onOpenDrawer}
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="max-lg:hidden"
        aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        aria-pressed={collapsed}
        onClick={onToggleCollapsed}
      >
        {collapsed ? (
          <PanelLeftOpen aria-hidden="true" className="size-5" />
        ) : (
          <PanelLeftClose aria-hidden="true" className="size-5" />
        )}
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        aria-label={dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        onClick={() => update({ theme: dark ? "light" : "dark" })}
      >
        {dark ? (
          <Sun aria-hidden="true" className="size-5" />
        ) : (
          <Moon aria-hidden="true" className="size-5" />
        )}
      </Button>

      {me && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 pr-1.5 pl-3"
              aria-label={`Tài khoản của ${me.name}`}
            >
              <span className="max-w-40 truncate max-sm:hidden">{me.name}</span>
              <Avatar className="size-7">
                {(me.avatarId || me.image) && (
                  <AvatarImage src={avatarUrl(API_URL, me) ?? undefined} alt="" />
                )}
                <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                  {initials(me.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{me.name}</span>
              <span className="text-xs text-muted-foreground">{me.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={preferences.transparency === "off"}
              onCheckedChange={(checked) => update({ transparency: checked ? "off" : "system" })}
              onSelect={(event) => event.preventDefault()}
            >
              Giảm trong suốt
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut.run()}>
              <LogOut aria-hidden="true" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
