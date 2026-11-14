import {
  type ColumnDef,
  type RowData,
  createColumnHelper,
  rowSelectionFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { Checkbox } from "@xom-nho/ui/components/checkbox";

/**
 * Tính năng TanStack Table (bản 9) mọi bảng admin dùng: chỉ chọn dòng. Phân trang, sắp xếp, lọc do server làm và
 * nằm trên URL (`useUrlState`), không để Table xử lý. Khai báo một lần ở cấp module (Table yêu cầu ổn định).
 */
export const adminTableFeatures = tableFeatures({ rowSelectionFeature });
export type AdminTableFeatures = typeof adminTableFeatures;

// `any` cho TValue: cách TanStack khai báo mảng cột có nhiều kiểu giá trị khác nhau
// oxlint-disable-next-line typescript/no-explicit-any
export type AdminColumnDef<TData extends RowData> = ColumnDef<AdminTableFeatures, TData, any>;

export function adminColumnHelper<TData extends RowData>() {
  return createColumnHelper<AdminTableFeatures, TData>();
}

/**
 * Cột chọn dòng (pages/admin.md: chọn nhiều + thanh hành động hàng loạt). Ô đầu bảng chọn cả trang, hiện dấu gạch
 * khi mới chọn một phần. `rowLabel` cho nhãn đọc màn hình của từng ô ("Chọn bài Chợ phiên").
 */
export function selectColumn<TData extends RowData>(
  rowLabel: (row: TData) => string,
): AdminColumnDef<TData> {
  return adminColumnHelper<TData>().display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Chọn tất cả dòng trên trang"
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={rowLabel(row.original)}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
      />
    ),
  });
}

export interface SortValue {
  /** Khóa sắp xếp gửi lên API (ví dụ `likes`) */
  key: string;
  order: "asc" | "desc";
}
