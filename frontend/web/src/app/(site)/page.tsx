import { FEED_MESSAGES } from "@xom-nho/api";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import { HomeGreeting } from "@/features/auth";
import { FeedSidebar, FeedSidebarSkeleton, HomeFeed, PostListSkeleton } from "@/features/posts";

export const metadata: Metadata = {
  description:
    "Bài viết mới nhất của hàng xóm: chuyện đời sống, công nghệ, học tập, kể chuyện, hỏi đáp.",
};

// Bố cục MASTER mục 8: feed một cột 720px, từ 1024px thêm cột phải 300px (danh mục, tag nổi bật)
export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-6 md:py-12 lg:px-8">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8 lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[minmax(0,720px)_300px] lg:justify-between">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold md:text-3xl">Bài viết trong xóm</h1>
            <Suspense fallback={<Skeleton className="h-6 w-72 max-w-full" />}>
              <HomeGreeting />
            </Suspense>
          </header>

          <ErrorBoundary message={FEED_MESSAGES.LOAD_ERROR}>
            <Suspense fallback={<PostListSkeleton />}>
              <HomeFeed searchParams={searchParams} />
            </Suspense>
          </ErrorBoundary>
        </div>

        <aside aria-label="Danh mục và thẻ" className="hidden lg:block">
          <div className="sticky top-20">
            <Suspense fallback={<FeedSidebarSkeleton />}>
              <FeedSidebar />
            </Suspense>
          </div>
        </aside>
      </div>
    </main>
  );
}
