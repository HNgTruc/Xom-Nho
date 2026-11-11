"use client";

import { ERROR_MESSAGES } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";

// Lỗi không lường trước trong các trang chính: câu tiếng Việt + nút thử lại, không hiện chi tiết kỹ thuật
export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <div
        role="alert"
        className="glass-strong flex animate-rise-in flex-col items-start gap-4 rounded-xl p-6"
      >
        <h1 className="text-xl font-semibold">Ôi, trang chưa hiện được</h1>
        <p className="text-muted-foreground">{ERROR_MESSAGES.INTERNAL_ERROR}</p>
        <Button onClick={() => retry()}>Thử lại</Button>
      </div>
    </main>
  );
}
