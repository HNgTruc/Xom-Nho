"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import type { ReactNode } from "react";

const numberFormat = new Intl.NumberFormat("vi-VN");

/**
 * Nút tròn ở header mở một bảng kính (Thông báo, Tin nhắn), đặt cạnh ảnh đại diện (MASTER mục 8).
 * Nút chỉ có biểu tượng nên bắt buộc có nhãn tiếng Việt; có số chưa đọc thì nhãn đọc kèm số, chấm số trên nút
 * chỉ để nhìn. `items` rỗng thì hiện `emptyMessage`.
 */
export function HeaderPanel({
  label,
  icon,
  title,
  unread = 0,
  emptyMessage,
  items,
}: {
  label: string;
  icon: ReactNode;
  title: string;
  unread?: number;
  emptyMessage: string;
  items?: ReactNode;
}) {
  const unreadText = unread > 99 ? "99+" : numberFormat.format(unread);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unread > 0 ? `${label}, ${unreadText} chưa đọc` : label}
        className="glass-button relative inline-flex size-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-glass-button-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:bg-glass-button-hover [&_svg]:size-5"
      >
        {icon}
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground tabular-nums"
          >
            {unreadText}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-80 max-w-[calc(100vw-1rem)]">
        <DropdownMenuLabel className="text-base font-semibold text-foreground">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items ?? (
          // Mục vô hiệu (không bấm được) để trình đọc màn hình đọc lời nhắn; giữ độ đậm chữ phụ (không làm mờ 50%)
          <DropdownMenuItem
            disabled
            className="justify-center py-6 text-center text-sm whitespace-normal text-muted-foreground data-disabled:opacity-100"
          >
            {emptyMessage}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
