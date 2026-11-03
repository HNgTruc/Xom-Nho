import type { ReactNode } from "react";

/** Danh sách không có gì: một câu thân thiện (docs/giong-van-va-giao-dien.md), có thể kèm hành động. */
export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border px-6 py-12 text-center">
      <p className="text-base text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
