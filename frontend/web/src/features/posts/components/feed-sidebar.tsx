import { Badge } from "@xom-nho/ui/components/badge";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { getFeedSidebar } from "../api/get-feed-sidebar";
import { categoryDotClass } from "../lib/category-color";

const headingClass = "text-sm font-semibold text-foreground";
const linkClass =
  "flex min-h-10 items-center gap-2 rounded-sm px-2 text-base transition-colors duration-[120ms] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Cột phải (từ 1024px, MASTER mục 8): danh mục kèm số bài, và các tag dùng nhiều. Không có dữ liệu thì ẩn khối đó. */
export async function FeedSidebar() {
  const { categories, tags } = await getFeedSidebar();

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 0 && (
        <section aria-labelledby="sidebar-categories" className="flex flex-col gap-2">
          <h2 id="sidebar-categories" className={headingClass}>
            Danh mục
          </h2>
          <ul className="flex flex-col">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/danh-muc/${category.slug}`} className={linkClass}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      categoryDotClass(category.color),
                    )}
                  />
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.postCount}
                    <span className="sr-only"> bài</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tags.length > 0 && (
        <section aria-labelledby="sidebar-tags" className="flex flex-col gap-3">
          <h2 id="sidebar-tags" className={headingClass}>
            Thẻ nổi bật
          </h2>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.id}>
                <Badge asChild variant="outline" className="h-8 px-3">
                  <Link href={`/tag/${tag.slug}`}>{tag.name}</Link>
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function FeedSidebarSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải danh mục" className="flex flex-col gap-3">
      <Skeleton className="h-5 w-24" />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
