import {
  type Category,
  FEED_MESSAGES,
  SEARCH_MESSAGES,
  searchEmptyMessage,
  searchQuerySchema,
} from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import type { CSSProperties } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { requireUser } from "@/features/auth";
import { ArchiveHeader, getCategories, PostCard } from "@/features/posts";
import { requestTime } from "@/lib/request-time";
import { parseSearchParams, type RawSearchParams } from "@/lib/search-params";
import { searchPosts } from "../api/search-posts";
import { searchHref } from "../lib/search-href";

const chipClass =
  "inline-flex h-11 shrink-0 items-center rounded-full px-4 text-base font-medium whitespace-nowrap transition-colors duration-120 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:h-10";

/**
 * Lọc kết quả theo danh mục: "Tất cả" rồi từng danh mục, bằng liên kết (giữ từ khóa, về trang 1).
 * Thanh `glass-button` như tab sắp xếp (MASTER mục 8); nhiều danh mục thì cuộn ngang bên trong thanh.
 */
function CategoryFilter({
  q,
  current,
  categories,
}: {
  q: string;
  current?: string;
  categories: Category[];
}) {
  const items = [
    { slug: undefined, name: SEARCH_MESSAGES.ALL_CATEGORIES },
    ...categories.map((category) => ({ slug: category.slug, name: category.name })),
  ];
  return (
    <nav aria-label="Lọc theo danh mục" className="min-w-0 animate-rise-in [--stagger:1]">
      <ul className="glass-button flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none] sm:inline-flex">
        {items.map((item) => {
          const active = item.slug === current;
          return (
            <li key={item.slug ?? "all"}>
              <Link
                href={searchHref({ q, category: item.slug })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  chipClass,
                  active ? "glass-primary" : "text-foreground hover:bg-glass-button-hover",
                )}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Trang `/tim-kiem` (docs/tinh-nang.md mục 2.5): đầu trang có từ khóa và số bài, lọc theo danh mục, kết quả
 * như feed, phân trang. Từ khóa rỗng thì chỉ nhắc gõ từ khóa, không gọi backend.
 * Chỉ cho thành viên (ADR 0007). Đọc `searchParams` nên phải nằm trong `<Suspense>`.
 */
export async function SearchView({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = parseSearchParams(searchQuerySchema, await searchParams);
  const { q, category, page } = query;
  const viewer = await requireUser(searchHref({ q, category, page }));

  if (!q) {
    return (
      <>
        <header className="glass animate-rise-in rounded-xl p-5 sm:p-6">
          <h1 className="text-2xl font-bold md:text-3xl">{SEARCH_MESSAGES.TITLE}</h1>
        </header>
        <EmptyState message={SEARCH_MESSAGES.PROMPT} />
      </>
    );
  }

  // Thanh lọc chỉ là phần phụ: backend lỗi thì vẫn hiện kết quả, không có thanh lọc
  const [{ data: posts, meta }, categories, now] = await Promise.all([
    searchPosts(query),
    getCategories().catch(() => []),
    requestTime(),
  ]);

  return (
    <>
      <ArchiveHeader label={SEARCH_MESSAGES.TITLE} title={`“${q}”`} postCount={meta.total} />
      {categories.length > 0 && <CategoryFilter q={q} current={category} categories={categories} />}

      {posts.length === 0 ? (
        meta.total === 0 ? (
          <EmptyState message={searchEmptyMessage(q)} />
        ) : (
          <EmptyState
            message={FEED_MESSAGES.PAGE_EMPTY}
            action={
              <Button asChild variant="outline">
                <Link href={searchHref({ q, category })}>Về trang đầu</Link>
              </Button>
            }
          />
        )
      ) : (
        <ol className="flex flex-col gap-4">
          {posts.map((post, index) => (
            // Hiện ra lần lượt sau đầu trang và thanh lọc (bậc 0, 1): MASTER 5
            <li
              key={post.id}
              className="animate-rise-in"
              style={{ "--stagger": index + 2 } as CSSProperties}
            >
              <PostCard post={post} now={now} viewerId={viewer.id} categories={categories} />
            </li>
          ))}
        </ol>
      )}

      {posts.length > 0 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hrefFor={(target) => searchHref({ q, category, page: target })}
        />
      )}
    </>
  );
}
