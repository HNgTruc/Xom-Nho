import { FEED_MESSAGES, listPostsQuerySchema } from "@xom-nho/shared";
import { Button } from "@xom-nho/ui/components/button";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { requestTime } from "@/lib/request-time";
import { parseSearchParams, type RawSearchParams } from "@/lib/search-params";
import { getPosts } from "../api/get-posts";
import { feedHref } from "../lib/feed-href";
import { PostCard } from "./post-card";
import { SortTabs } from "./sort-tabs";

/**
 * Feed trang chủ: tab sắp xếp, danh sách bài, phân trang. Đọc `searchParams` (dữ liệu lúc có request),
 * nên trang phải bọc nó trong `<Suspense>`. Query sai (`?page=abc`) thì về mặc định, không báo lỗi.
 */
export async function HomeFeed({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = parseSearchParams(listPostsQuerySchema, await searchParams);
  // Một mốc thời gian cho cả trang để "2 giờ trước" của các thẻ tính cùng lúc
  const [{ data: posts, meta }, now] = await Promise.all([getPosts(query), requestTime()]);

  return (
    <div className="flex flex-col gap-6">
      <SortTabs current={query.sort} />

      {posts.length === 0 ? (
        meta.total === 0 ? (
          <EmptyState message={FEED_MESSAGES.EMPTY} />
        ) : (
          <EmptyState
            message={FEED_MESSAGES.PAGE_EMPTY}
            action={
              <Button asChild variant="outline">
                <Link href={feedHref(query.sort)}>Về trang đầu</Link>
              </Button>
            }
          />
        )
      ) : (
        <ol className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} now={now} />
            </li>
          ))}
        </ol>
      )}

      {/* Trang trống (vượt quá số trang) đã có nút "Về trang đầu", không hiện thêm thanh phân trang */}
      {posts.length > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hrefFor={(page) => feedHref(query.sort, page)}
        />
      )}
    </div>
  );
}
