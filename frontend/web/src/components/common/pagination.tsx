import { cn } from "@xom-nho/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { pageItems } from "./page-items";

// Cao 44px để dễ bấm trên điện thoại (MASTER mục 10), từ 640px về 40px như nút thường
const itemClass =
  "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium transition-colors duration-120 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:h-10 sm:min-w-10";

/**
 * Thanh phân trang bằng liên kết (`?page=`): mở tab mới, chia sẻ, nút quay lại đều đúng trang.
 * Điện thoại chỉ hiện "Trang 2 / 5" và hai nút trước, sau; từ 640px mới hiện dãy số.
 * Thanh kính dạng viên thuốc như tab sắp xếp (MASTER 2.4: chữ phụ không đặt thẳng trên nền loang).
 */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Phân trang"
      className="glass-button flex items-center justify-between gap-2 rounded-full p-1 sm:mx-auto sm:w-fit sm:justify-center"
    >
      {hasPrevious ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className={cn(itemClass, "hover:bg-glass-button-hover")}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Trang trước
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(itemClass, "invisible")}>
          Trang trước
        </span>
      )}

      <p className="text-sm font-medium sm:hidden">
        Trang {page} / {totalPages}
      </p>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className={cn(itemClass, "glass-primary")}>
                  <span className="sr-only">Trang </span>
                  {item}
                </span>
              ) : (
                <Link href={hrefFor(item)} className={cn(itemClass, "hover:bg-glass-button-hover")}>
                  <span className="sr-only">Trang </span>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>

      {hasNext ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className={cn(itemClass, "hover:bg-glass-button-hover")}
        >
          Trang sau
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(itemClass, "invisible")}>
          Trang sau
        </span>
      )}
    </nav>
  );
}
