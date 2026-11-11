"use client";

import * as React from "react";
import { cn } from "cn";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@xom-nho/ui/components/input";

// Ô mật khẩu có nút hiện/ẩn (WCAG 2.2 "Accessible Authentication": cho dán, cho trình quản lý mật khẩu điền).
// Nút 40×40 nằm trong ô, nhãn tiếng Việt đổi theo trạng thái, `aria-pressed` cho trình đọc màn hình.
function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
        aria-controls={props.id}
        disabled={props.disabled}
        className="absolute inset-y-0 right-0 inline-flex size-10 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none"
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
