import { POST_SORT_LABELS, POST_SORT_VALUES, type PostSort } from "@xom-nho/api";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { feedHref } from "../lib/feed-href";

/**
 * Tab "Mới" / "Nhiều người đọc" bằng liên kết (`?sort=`), nên chia sẻ và nút quay lại giữ đúng tab.
 * Thanh kính dạng viên thuốc (MASTER mục 8), hiện ra ngay sau đầu trang (MASTER 5).
 * Thanh là kính mỏng `glass-button` (chữ dùng foreground, không dùng chữ phụ: MASTER 2.4); tab đang chọn
 * là viên `glass-primary`, kèm `aria-current` cho trình đọc màn hình.
 */
export function SortTabs({ current, basePath = "/" }: { current: PostSort; basePath?: string }) {
  return (
    <nav aria-label="Sắp xếp bài viết" className="animate-rise-in [--stagger:1]">
      <ul className="glass-button inline-flex gap-1 rounded-full p-1">
        {POST_SORT_VALUES.map((sort) => {
          const active = sort === current;
          return (
            <li key={sort}>
              <Link
                href={feedHref(sort, 1, basePath)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-base font-medium transition-colors duration-120 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:h-10",
                  active ? "glass-primary" : "text-foreground hover:bg-glass-button-hover",
                )}
              >
                {POST_SORT_LABELS[sort]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
