import { POST_SORT_LABELS, POST_SORT_VALUES, type PostSort } from "@xom-nho/api";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { feedHref } from "../lib/feed-href";

/**
 * Tab "Mới" / "Nhiều người đọc" bằng liên kết (`?sort=`), nên chia sẻ và nút quay lại giữ đúng tab.
 * Tab đang chọn: chữ màu primary và gạch chân, kèm `aria-current` cho trình đọc màn hình.
 */
export function SortTabs({ current }: { current: PostSort }) {
  return (
    <nav aria-label="Sắp xếp bài viết" className="border-b border-border">
      <ul className="-mb-px flex gap-2">
        {POST_SORT_VALUES.map((sort) => {
          const active = sort === current;
          return (
            <li key={sort}>
              <Link
                href={feedHref(sort)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 px-3 text-base font-medium transition-colors duration-[120ms] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
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
