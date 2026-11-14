import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@xom-nho/ui/components/sheet";
import { cn } from "@xom-nho/ui/lib/utils";
import { useState } from "react";
import { Outlet } from "react-router";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { AdminBackdrop } from "@/components/common/admin-backdrop";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * Khung trang quản trị (pages/admin.md "Kính mờ", "Bố cục"): ảnh nền biển, khung `glass-shell` cách mép 12px bo
 * radius-2xl, trong đó sidebar `glass` (240px, thu gọn 64px, nhớ theo máy) và cột phải gồm topbar + nội dung (tối
 * đa 1440px). Dưới 1024px sidebar thành ngăn kéo trượt từ trái, mở bằng nút menu trên topbar.
 */
export function AdminLayout() {
  const [collapsed, setCollapsed] = useLocalStorageState("xom-nho-admin:sidebar-collapsed", false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AdminBackdrop />
      <a
        href="#noi-dung"
        className="sr-only z-50 rounded-full bg-background px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Bỏ qua điều hướng
      </a>
      <div className="p-2 sm:p-3">
        <div className="glass-shell flex min-h-[calc(100dvh-1rem)] gap-3 rounded-2xl p-2 sm:min-h-[calc(100dvh-1.5rem)] sm:p-3">
          <aside
            className={cn(
              "glass sticky top-3 hidden h-[calc(100dvh-3rem)] shrink-0 rounded-xl p-3 transition-[width] duration-200 ease-standard motion-reduce:transition-none lg:block",
              collapsed ? "w-16 px-2" : "w-60",
            )}
          >
            <Sidebar collapsed={collapsed} />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Topbar
              collapsed={collapsed}
              onToggleCollapsed={() => setCollapsed(!collapsed)}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
            <main
              id="noi-dung"
              tabIndex={-1}
              className="mx-auto w-full max-w-360 flex-1 outline-none"
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="p-4 pt-16">
          <SheetTitle className="sr-only">Điều hướng trang quản trị</SheetTitle>
          <SheetDescription className="sr-only">Chọn một mục để mở</SheetDescription>
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
