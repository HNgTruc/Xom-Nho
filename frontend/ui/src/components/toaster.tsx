"use client";

// Toast (thư viện sonner, chủ dự án duyệt 2026-11-14), dùng thay bản shadcn vì bản đó cần `next-themes` (admin là
// Vite). Không dùng kiểu mặc định của sonner (`unstyled`): mỗi toast là tấm `glass-bar` bo radius-xl như menu thả
// xuống, chữ `foreground` 14px, nút hành động ("Hoàn tác") là nút viền kính cao 40px. Màu theo token nên tự đổi theo
// class `dark` trên `<html>`. Đặt `<Toaster />` một lần ở gốc app; gọi `toast("Đã ẩn bài", { action })` ở chỗ dùng.
// Sonner tự có vùng `aria-live`, tạm dừng tự ẩn khi rê chuột hoặc focus, đóng bằng phím.

import { cn } from "cn";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

const buttonBase =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium transition-colors duration-120 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      duration={6000}
      visibleToasts={3}
      containerAriaLabel="Thông báo"
      {...props}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: "Đóng thông báo",
        ...toastOptions,
        classNames: {
          toast: cn(
            "glass-bar flex w-full items-center gap-3 rounded-xl p-4 text-sm text-foreground shadow-glass-hover sm:w-(--width)",
          ),
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          title: "font-medium",
          description: "text-muted-foreground",
          actionButton: cn(buttonBase, "glass-button hover:bg-glass-button-hover"),
          cancelButton: cn(buttonBase, "text-foreground hover:bg-glass-button"),
          error: "text-destructive",
          ...toastOptions?.classNames,
        },
      }}
    />
  );
}

export { Toaster, toast };
