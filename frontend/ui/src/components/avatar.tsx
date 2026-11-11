"use client";

import type * as React from "react";
import { cn } from "cn";
import { Avatar as AvatarPrimitive } from "radix-ui";

// MASTER: avatar bo tròn; 24px trong feed (sm), 32px ở bình luận (mặc định), 40px ở hồ sơ (lg).
// Viền `border`: chế độ tối nền muted trùng nền card, không có viền thì avatar dự phòng mất hình tròn.
// Ảnh lỗi hoặc chưa tải xong thì hiện AvatarFallback (chữ cái đầu), nên dùng được với URL ảnh bất kỳ.
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg";
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full border border-border select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
        className,
      )}
      {...props}
    />
  );
}

/** Ảnh trang trí đi kèm tên người: truyền `alt=""` để trình đọc màn hình không đọc lặp tên. */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

// Chữ muted-foreground trên nền muted: 5.1:1 (MASTER mục 2.1). Cỡ 24px dùng chữ 12px, không nhỏ hơn.
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center bg-muted text-sm font-medium text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
