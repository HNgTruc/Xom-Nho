"use client";

// shadcn radix-nova, chỉnh theo MASTER: hộp 16px nhưng vùng bấm 40×32px (lớp `after`, đủ cho dòng bảng admin 32px,
// pages/admin.md), focus `ring-2` có khoảng cách như mọi điều khiển, đã chọn nền `primary`. Nhãn đọc màn hình đặt
// ở chỗ dùng (`aria-label` "Chọn bài ..." hoặc `<Label htmlFor>`).

import * as React from "react";
import { cn } from "cn";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon, MinusIcon } from "lucide-react";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-input bg-card transition-colors duration-120 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group grid place-content-center text-current [&>svg]:size-3.5"
      >
        {/* "Chọn tất cả" khi mới chọn một phần trang: dấu gạch thay dấu tích */}
        {props.checked === "indeterminate" ? (
          <MinusIcon aria-hidden="true" strokeWidth={3} />
        ) : (
          <CheckIcon aria-hidden="true" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
