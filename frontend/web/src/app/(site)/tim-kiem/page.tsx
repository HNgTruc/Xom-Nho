import { SEARCH_MESSAGES } from "@xom-nho/api";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import { ArchiveViewSkeleton, FeedLayout } from "@/features/posts";
import { SearchView } from "@/features/search";

// Trang kết quả tùy từ khóa: không cho máy tìm kiếm lập chỉ mục
export const metadata: Metadata = {
  title: SEARCH_MESSAGES.TITLE,
  robots: { index: false, follow: false },
};

export default function SearchPage({ searchParams }: PageProps<"/tim-kiem">) {
  return (
    <FeedLayout>
      <ErrorBoundary message={SEARCH_MESSAGES.LOAD_ERROR}>
        <Suspense fallback={<ArchiveViewSkeleton />}>
          <SearchView searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </FeedLayout>
  );
}
