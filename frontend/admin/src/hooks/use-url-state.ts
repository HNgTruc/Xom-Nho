import { useCallback } from "react";
import { useSearchParams } from "react-router";

type UrlValues = Record<string, string | number | undefined | null>;

/**
 * Bộ lọc, trang, từ khóa, sắp xếp của bảng lưu trên URL (`.claude/rules/frontend-admin.md`): tải lại hay gửi link
 * vẫn giữ nguyên. `params` là giá trị thô (chuỗi) để đưa qua schema Zod của `@xom-nho/api` (schema lo ép kiểu,
 * mặc định, bỏ ô rỗng). `set` đổi nhiều khóa một lần; giá trị rỗng thì xóa khóa khỏi URL. Đổi bộ lọc thì về
 * trang 1 (`resetPage`, mặc định bật) để không rơi vào trang không còn dữ liệu.
 */
export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = Object.fromEntries(searchParams.entries());

  const set = useCallback(
    (values: UrlValues, { resetPage = true }: { resetPage?: boolean } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(values)) {
            if (value === undefined || value === null || value === "") next.delete(key);
            else next.set(key, String(value));
          }
          if (resetPage && !("page" in values)) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { params, set };
}
