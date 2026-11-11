import { FEED_MESSAGES } from "@xom-nho/api";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import { HomeGreeting } from "@/features/auth";
import { FeedLayout, PostFeed, PostListSkeleton } from "@/features/posts";

export const metadata: Metadata = {
  description:
    "Bài viết mới nhất của hàng xóm: chuyện đời sống, công nghệ, học tập, kể chuyện, hỏi đáp.",
};

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <FeedLayout>
      <header className="glass flex animate-rise-in flex-col gap-2 rounded-xl p-5 sm:p-6">
        <h1 className="text-2xl font-bold md:text-3xl">Bài viết trong xóm</h1>
        <Suspense fallback={<Skeleton className="h-6 w-72 max-w-full" />}>
          <HomeGreeting />
        </Suspense>
      </header>

      <ErrorBoundary message={FEED_MESSAGES.LOAD_ERROR}>
        <Suspense fallback={<PostListSkeleton />}>
          <PostFeed searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </FeedLayout>
  );
}
