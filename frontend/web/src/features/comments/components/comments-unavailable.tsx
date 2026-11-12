"use client";

import { COMMENT_MESSAGES } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Không tải được bình luận: câu tiếng Việt + "Thử lại" (MASTER mục 7, trạng thái lỗi). Bài vẫn đọc được. */
export function CommentsUnavailable() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div role="alert" className="flex flex-col items-start gap-3">
      <p className="text-base text-muted-foreground">{COMMENT_MESSAGES.LOAD_FAILED}</p>
      <Button
        type="button"
        variant="outline"
        loading={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        Thử lại
      </Button>
    </div>
  );
}
