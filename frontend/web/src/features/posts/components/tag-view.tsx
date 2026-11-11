import { FEED_MESSAGES } from "@xom-nho/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import type { RawSearchParams } from "@/lib/search-params";
import { getTag } from "../api/get-tag";
import { ArchiveHeader } from "./archive-header";
import { PostFeed } from "./post-feed";
import { PostListSkeleton } from "./post-list-skeleton";

/**
 * Trang `/tag/<slug>` (docs/tinh-nang.md mục 2.4): đầu trang thẻ rồi feed lọc theo thẻ.
 * Thẻ chưa có bài vẫn hiện trang (lời nhắn trống), chỉ thẻ không tồn tại mới 404.
 */
export async function TagView({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) notFound();

  return (
    <>
      <ArchiveHeader label="Thẻ" title={tag.name} />
      <ErrorBoundary message={FEED_MESSAGES.LOAD_ERROR}>
        <Suspense fallback={<PostListSkeleton />}>
          <PostFeed
            searchParams={searchParams}
            filter={{ tag: tag.slug }}
            basePath={`/tag/${tag.slug}`}
            emptyMessage={FEED_MESSAGES.TAG_EMPTY}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
