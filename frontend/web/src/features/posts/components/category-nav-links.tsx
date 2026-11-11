"use client";

import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Thanh điều hướng dạng viên thuốc trong header (MASTER mục 8): mục đang xem là viên `primary`.
 * Client component chỉ để đọc đường dẫn hiện tại; danh sách mục do server truyền vào.
 * Màn hẹp: cả hàng cuộn ngang bên trong thanh, trang không bị cuộn ngang.
 */
export function CategoryNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:h-10",
                active ? "glass-primary" : "text-foreground hover:bg-glass-button-hover",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
