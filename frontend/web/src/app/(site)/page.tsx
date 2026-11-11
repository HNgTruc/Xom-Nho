import { FEED_MESSAGES } from "@xom-nho/api";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import {
  FeedLayout,
  HomeComposer,
  HomeComposerSkeleton,
  PostFeed,
  PostListSkeleton,
} from "@/features/posts";

export const metadata: Metadata = {
  description:
    "Bài viết mới nhất của hàng xóm: chuyện đời sống, công nghệ, học tập, kể chuyện, hỏi đáp.",
};

// Đầu trang là tấm tạo bài (docs/tinh-nang.md mục 2.3); tiêu đề trang chỉ cho trình đọc màn hình
export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <FeedLayout>
      <h1 className="sr-only">Bài viết trong xóm</h1>
      <Suspense fallback={<HomeComposerSkeleton />}>
        <HomeComposer />
      </Suspense>

      <ErrorBoundary message={FEED_MESSAGES.LOAD_ERROR}>
        <Suspense fallback={<PostListSkeleton />}>
          <PostFeed searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </FeedLayout>
  );
}
