import type { PaginationMeta } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@xom-nho/ui/components/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";

const PAGE_SIZES = [20, 50, 100];
const numberFormat = new Intl.NumberFormat("vi-VN");

/**
 * Phân trang dưới bảng (pages/admin.md "Bảng dữ liệu"): tổng số ("Hiển thị 1–20 trong 128 bài"), chọn số dòng mỗi
 * trang (20, 50, 100), trang trước/sau. Trang, số dòng nằm trên URL ở chỗ dùng.
 */
export function Pagination({
  meta,
  unit,
  onPageChange,
  onPageSizeChange,
  pageSizes = PAGE_SIZES,
}: {
  meta: PaginationMeta;
  /** Đơn vị đếm: "bài", "bình luận", "thành viên" */
  unit: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizes?: number[];
}) {
  const id = useId();
  const { page, pageSize, total, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3 text-sm">
      <p className="text-muted-foreground" aria-live="polite">
        Hiển thị {numberFormat.format(from)}–{numberFormat.format(to)} trong{" "}
        {numberFormat.format(total)} {unit}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor={`${id}-size`} className="text-muted-foreground">
              Số dòng mỗi trang
            </label>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger id={`${id}-size`} className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <nav aria-label="Phân trang" className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Trang trước"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Button>
          <span className="min-w-24 text-center tabular-nums">
            Trang {page} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Trang sau"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
