import { FEED_MESSAGES } from "@xom-nho/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/error-state";
import { requireUser } from "@/features/auth";
import type { RawSearchParams } from "@/lib/search-params";
import { getCategory } from "../api/get-category";
import { ArchiveHeader, ArchiveHeaderSkeleton } from "./archive-header";
import { CategoryMark } from "./category-mark";
import { PostFeed } from "./post-feed";
import { PostListSkeleton } from "./post-list-skeleton";

/**
 * Trang `/danh-muc/<slug>` (docs/tinh-nang.md mục 2.4): đầu trang danh mục rồi feed lọc theo danh mục.
 * Chỉ cho thành viên (ADR 0007). Đọc `params` nên phải nằm trong `<Suspense>`. Không có danh mục thì 404.
 */
export async function CategoryView({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  await requireUser(`/danh-muc/${slug}`);
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <ArchiveHeader
        label="Danh mục"
        title={category.name}
        description={category.description}
        postCount={category.postCount}
        icon={<CategoryMark color={category.color} icon={category.icon} size="lg" />}
      />
      <ErrorBoundary message={FEED_MESSAGES.LOAD_ERROR}>
        <Suspense fallback={<PostListSkeleton />}>
          <PostFeed
            searchParams={searchParams}
            filter={{ category: category.slug }}
            basePath={`/danh-muc/${category.slug}`}
            emptyMessage={FEED_MESSAGES.CATEGORY_EMPTY}
          />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

/** Giữ chỗ cho cả trang danh mục / thẻ khi chưa biết danh mục có tồn tại không. */
export function ArchiveViewSkeleton() {
  return (
    <>
      <ArchiveHeaderSkeleton />
      <PostListSkeleton />
    </>
  );
}
