import {
  type RowData,
  type RowSelectionState,
  type Updater,
  useTable,
} from "@tanstack/react-table";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@xom-nho/ui/components/table";
import { cn } from "@xom-nho/ui/lib/utils";
import type { ReactNode } from "react";
import { ErrorState } from "@/components/common/state-message";
import { type AdminColumnDef, adminTableFeatures, type SortValue } from "./columns";

const SKELETON_ROWS = 5;
const noSelection: RowSelectionState = {};

/**
 * Bảng dùng chung của trang quản trị (pages/admin.md "Bảng dữ liệu", TanStack Table bản 9). Bảng nằm trên tấm
 * `glass-strong`; dữ liệu là một trang server trả về (không chép vào state: `data` lấy thẳng từ TanStack Query).
 * Có đủ 4 trạng thái: đang tải (dòng xương), lỗi (thử lại), trống (`empty`), có dữ liệu. `columnClassNames` để ẩn
 * cột ít quan trọng dưới 1280px (`max-xl:hidden`). `dimRow`: dòng mờ 60% (bài đang ẩn).
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  caption,
  isPending,
  isError,
  onRetry,
  empty,
  rowSelection,
  onRowSelectionChange,
  sort,
  columnClassNames = {},
  dimRow,
  footer,
}: {
  columns: AdminColumnDef<TData>[];
  /** Một trang dữ liệu; mảng ổn định (đừng tạo `[]` mới mỗi lần vẽ) */
  data: TData[];
  getRowId: (row: TData) => string;
  /** Mô tả bảng cho trình đọc màn hình ("Bài viết, mới đăng trước") */
  caption: string;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  empty: ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (value: RowSelectionState) => void;
  sort?: SortValue;
  columnClassNames?: Record<string, string>;
  dimRow?: (row: TData) => boolean;
  /** Phân trang dưới bảng */
  footer?: ReactNode;
}) {
  const selection = rowSelection ?? noSelection;
  const table = useTable({
    features: adminTableFeatures,
    columns,
    data,
    getRowId,
    enableRowSelection: onRowSelectionChange !== undefined,
    state: { rowSelection: selection },
    onRowSelectionChange: (updater: Updater<RowSelectionState>) =>
      onRowSelectionChange?.(typeof updater === "function" ? updater(selection) : updater),
  });

  const headerGroups = table.getHeaderGroups();
  const columnCount = columns.length;
  const rows = table.getRowModel().rows;

  return (
    <div className="glass-strong rounded-xl p-2 sm:p-3">
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          {headerGroups.map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const sortedBy = sort?.key === header.column.id;
                return (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className={columnClassNames[header.column.id]}
                    aria-sort={
                      sortedBy ? (sort.order === "desc" ? "descending" : "ascending") : undefined
                    }
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isPending && rows.length === 0 ? (
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index} aria-hidden="true" className="hover:bg-transparent">
                {headerGroups[0]?.headers.map((header) => (
                  <TableCell key={header.id} className={columnClassNames[header.column.id]}>
                    <Skeleton className="h-5 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError && rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount}>
                <ErrorState onRetry={onRetry} />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount}>{empty}</TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className={cn(dimRow?.(row.original) && "opacity-60")}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className={columnClassNames[cell.column.id]}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}
