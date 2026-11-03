export type PageItem = number | "gap";

/** Trang đầu, trang cuối, trang hiện tại và hai trang kề; chỗ bị bỏ là dấu "…". */
export function pageItems(page: number, totalPages: number): PageItem[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items: PageItem[] = [];
  for (const [index, p] of sorted.entries()) {
    const previous = sorted[index - 1];
    if (previous !== undefined && p - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && p - previous > 2) items.push("gap");
    items.push(p);
  }
  return items;
}
