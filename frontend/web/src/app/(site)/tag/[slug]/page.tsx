import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ARCHIVE_NOT_FOUND_METADATA,
  ArchiveViewSkeleton,
  FeedLayout,
  getTag,
  TagView,
  tagMetadata,
} from "@/features/posts";

export async function generateMetadata({ params }: PageProps<"/tag/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug).catch(() => null);
  return tag ? tagMetadata(tag) : ARCHIVE_NOT_FOUND_METADATA;
}

export default function TagPage({ params, searchParams }: PageProps<"/tag/[slug]">) {
  return (
    <FeedLayout>
      <Suspense fallback={<ArchiveViewSkeleton />}>
        <TagView params={params} searchParams={searchParams} />
      </Suspense>
    </FeedLayout>
  );
}
