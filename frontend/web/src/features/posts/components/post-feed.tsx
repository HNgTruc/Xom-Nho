import { FEED_MESSAGES, type ListPostsQuery, listPostsQuerySchema } from "@xom-nho/api";
import type { CSSProperties } from "react";
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

/** Bộ lọc do trang quyết định (từ đường dẫn), không lấy từ query: `?category=` trên trang chủ bị bỏ qua. */
export type PostFeedFilter = Pick<ListPostsQuery, "category" | "tag" | "author">;

/**
 * Danh sách bài có tab sắp xếp và phân trang: trang chủ, trang danh mục, trang tag.
 * Đọc `searchParams` (dữ liệu lúc có request), nên trang phải bọc nó trong `<Suspense>`.
 * Query sai (`?page=abc`) thì về mặc định, không báo lỗi.
 */
export async function PostFeed({
  searchParams,
  filter = {},
  basePath = "/",
  emptyMessage = FEED_MESSAGES.EMPTY,
}: {
  searchParams: Promise<RawSearchParams>;
  filter?: PostFeedFilter;
  basePath?: string;
  emptyMessage?: string;
}) {
  const query = parseSearchParams(listPostsQuerySchema, await searchParams);
  const { sort } = query;
  // Một mốc thời gian cho cả trang để "2 giờ trước" của các thẻ tính cùng lúc
  const [{ data: posts, meta }, now] = await Promise.all([
    getPosts({
      ...query,
      category: filter.category,
      tag: filter.tag,
      author: filter.author,
    }),
    requestTime(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <SortTabs current={sort} basePath={basePath} />

      {posts.length === 0 ? (
        meta.total === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <EmptyState
            message={FEED_MESSAGES.PAGE_EMPTY}
            action={
              <Button asChild variant="outline">
                <Link href={feedHref(sort, 1, basePath)}>Về trang đầu</Link>
              </Button>
            }
          />
        )
      ) : (
        <ol className="flex flex-col gap-4">
          {posts.map((post, index) => (
            // Hiện ra lần lượt sau đầu trang và tab (bậc 0, 1): MASTER 5
            <li
              key={post.id}
              className="animate-rise-in"
              style={{ "--stagger": index + 2 } as CSSProperties}
            >
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
          hrefFor={(target) => feedHref(sort, target, basePath)}
        />
      )}
    </div>
  );
}
