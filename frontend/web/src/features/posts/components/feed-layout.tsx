import type { ReactNode } from "react";
import { Suspense } from "react";
import { FeedSidebar, FeedSidebarSkeleton } from "./feed-sidebar";

/**
 * Bố cục MASTER mục 8 cho mọi trang danh sách bài (trang chủ, danh mục, tag), nằm trong khung kính:
 * feed một cột, từ 1024px thêm cột phải 320px (tấm kính tối: danh mục, thẻ nổi bật).
 */
export function FeedLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full flex-1 px-3 pt-4 pb-6 sm:px-4 md:px-6 md:pt-6 md:pb-8 lg:px-8">
      <div className="mx-auto flex max-w-[760px] flex-col gap-6 lg:grid lg:max-w-[1320px] lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">{children}</div>

        <aside aria-label="Danh mục và thẻ" className="hidden lg:block">
          <div className="sticky top-28">
            <Suspense fallback={<FeedSidebarSkeleton />}>
              <FeedSidebar />
            </Suspense>
          </div>
        </aside>
      </div>
    </main>
  );
}
