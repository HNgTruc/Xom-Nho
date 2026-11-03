import * as React from "react";
import { cn } from "cn";
import { CircleAlert } from "lucide-react";

// MASTER mục 7 "Form": lỗi ngay dưới ô, màu destructive, kèm biểu tượng (không chỉ dựa vào màu).
// Ô nhập trỏ tới lỗi bằng `aria-describedby={id}` và đặt `aria-invalid`. Không có lỗi thì không render.
function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null;

  return (
    <p
      data-slot="field-error"
      className={cn("flex items-start gap-1.5 text-sm text-destructive", className)}
      {...props}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export { FieldError };
