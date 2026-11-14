import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortValue } from "./columns";

/**
 * Tiêu đề cột bấm để sắp xếp ở server. Đang sắp theo cột này thì hiện mũi tên chiều; bấm lại thì đảo chiều. Chiều
 * cũng có trong `aria-sort` của `<th>` (DataTable đặt theo `sort`).
 */
export function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: string;
  sort: SortValue | undefined;
  onSort: (value: SortValue) => void;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.order === "desc" ? ArrowDown : ArrowUp;
  return (
    <button
      type="button"
      onClick={() =>
        onSort({ key: sortKey, order: active && sort.order === "desc" ? "asc" : "desc" })
      }
      className="-mx-2 inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-2 font-medium text-muted-foreground transition-colors duration-120 hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[active=true]:text-foreground"
      data-active={active}
    >
      {label}
      <Icon aria-hidden="true" className="size-3.5" />
    </button>
  );
}
