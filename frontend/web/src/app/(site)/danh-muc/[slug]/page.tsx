import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ARCHIVE_NOT_FOUND_METADATA,
  ArchiveViewSkeleton,
  CategoryView,
  categoryMetadata,
  FeedLayout,
  getCategory,
} from "@/features/posts";

export async function generateMetadata({
  params,
}: PageProps<"/danh-muc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug).catch(() => null);
  return category ? categoryMetadata(category) : ARCHIVE_NOT_FOUND_METADATA;
}

export default function CategoryPage({ params, searchParams }: PageProps<"/danh-muc/[slug]">) {
  return (
    <FeedLayout>
      <Suspense fallback={<ArchiveViewSkeleton />}>
        <CategoryView params={params} searchParams={searchParams} />
      </Suspense>
    </FeedLayout>
  );
}
