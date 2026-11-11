import type { ReactNode } from "react";

/**
 * Bố cục MASTER mục 8 cho mọi trang danh sách bài (trang chủ, danh mục, tag, hồ sơ), nằm trong khung kính:
 * feed một cột ở giữa. Danh mục đã có trên thanh điều hướng của header nên không có cột phải.
 */
export function FeedLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full flex-1 px-3 pt-4 pb-6 sm:px-4 md:px-6 md:pt-6 md:pb-8 lg:px-8">
      <div className="mx-auto flex max-w-[860px] min-w-0 flex-col gap-4">{children}</div>
    </main>
  );
}
