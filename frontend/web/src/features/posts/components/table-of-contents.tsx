import { cn } from "@xom-nho/ui/lib/utils";
import type { TocItem } from "@/lib/markdown";

/** Bài có ít nhất chừng này mục thì mới hiện mục lục (bài ngắn không cần). */
export const TOC_MIN_ITEMS = 3;

/** Mục lục tự động (docs/tinh-nang.md mục 2.2): liên kết tới `id` do rehype-slug gắn cho tiêu đề. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < TOC_MIN_ITEMS) return null;

  return (
    <nav aria-labelledby="toc-heading" className="rounded-md border border-border p-4 sm:p-5">
      <h2 id="toc-heading" className="text-sm font-semibold text-foreground">
        Trong bài này
      </h2>
      <ol className="mt-2 flex flex-col">
        {items.map((item) => (
          <li key={item.id} className={cn(item.depth === 3 && "pl-4")}>
            <a
              href={`#${item.id}`}
              className="flex min-h-10 items-center rounded-sm px-2 text-base text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
