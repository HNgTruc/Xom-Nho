"use client";

import { ERROR_MESSAGES } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { catchError, type ErrorInfo } from "next/error";

function ErrorFallback({ message }: { message?: string }, { retry }: ErrorInfo) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 glass rounded-xl px-6 py-12 text-center"
    >
      <p className="text-base text-muted-foreground">{message ?? ERROR_MESSAGES.INTERNAL_ERROR}</p>
      <Button variant="outline" onClick={() => retry()}>
        Thử lại
      </Button>
    </div>
  );
}

/**
 * Ranh giới lỗi cho một khối dữ liệu (không làm hỏng cả trang): câu tiếng Việt + nút "Thử lại" (MASTER mục 7).
 * Không hiện chi tiết lỗi kỹ thuật. `notFound()`, `redirect()` bên trong vẫn chạy bình thường.
 */
export const ErrorBoundary = catchError(ErrorFallback);
