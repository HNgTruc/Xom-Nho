import { Badge } from "@xom-nho/ui/components/badge";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { getFeedSidebar } from "../api/get-feed-sidebar";
import { categoryDotClass } from "../lib/category-color";

const headingClass = "text-sm font-semibold text-foreground";
const linkClass =
  "group flex min-h-10 items-center gap-2 rounded-full px-3 text-base transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * Cột phải (từ 1024px, MASTER mục 8): tấm kính tối làm điểm nhấn giữa trang sáng, như khối tối trong mẫu.
 * Class `dark` đổi mọi token bên trong sang bộ màu tối (chữ sáng, chấm danh mục sáng), tương phản đã tính
 * ở MASTER 2.4. Danh mục kèm số bài, và các tag dùng nhiều; không có dữ liệu thì ẩn khối đó.
 */
export async function FeedSidebar() {
  const { categories, tags } = await getFeedSidebar();

  return (
    <div className="dark glass-strong flex animate-rise-in flex-col gap-8 rounded-xl p-4 text-foreground [--stagger:2]">
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
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground tabular-nums transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-foreground">
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
                <Badge
                  asChild
                  variant="outline"
                  className="glass-button h-8 rounded-full px-3 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                >
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
    <div
      aria-busy="true"
      aria-label="Đang tải danh mục"
      className="dark glass-strong flex flex-col gap-3 rounded-xl p-4"
    >
      <Skeleton className="h-5 w-24" />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
