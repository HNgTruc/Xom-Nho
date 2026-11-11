import type { Metadata } from "next";
import { Suspense } from "react";
import { POST_STATUSES } from "@xom-nho/api";
import {
  getPost,
  HIDDEN_POST_METADATA,
  PostDetailSkeleton,
  PostDetailView,
  postMetadata,
} from "@/features/posts";

// Chỉ thành viên đọc được bài (ADR 0007): thẻ meta lấy theo người đang xem, dùng chung lần gọi với trang.
// Bài chưa đăng (chủ bài, trưởng xóm đang xem) dùng tiêu đề chung, không lập chỉ mục.
export async function generateMetadata({
  params,
}: PageProps<"/bai-viet/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  return post?.status === POST_STATUSES.PUBLISHED ? postMetadata(post) : HIDDEN_POST_METADATA;
}

// Cột đọc 720px (MASTER mục 4)
export default function PostPage({ params }: PageProps<"/bai-viet/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-3 pt-4 pb-6 sm:px-4 md:px-6 md:pt-6 md:pb-8">
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailView params={params} />
      </Suspense>
    </main>
  );
}
