"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

/** Lỗi chung của form (sai mật khẩu, bị khóa...). Có lỗi mới thì chuyển focus tới để trình đọc màn hình đọc ngay. */
export function FormAlert({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);

  if (!message) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive outline-none"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
