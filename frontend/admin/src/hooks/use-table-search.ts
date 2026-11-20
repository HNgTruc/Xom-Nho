import { useEffect, useState } from "react";
import { useDebouncedValue } from "./use-debounced-value";

/**
 * Ô tìm của bảng: chữ đổi ngay trên ô, `q` trên URL đổi sau khi ngừng gõ 300ms (để không gửi yêu cầu mỗi phím).
 * Ô rỗng hoặc chỉ có khoảng trắng thì bỏ `q`. Trả `[search, setSearch]` như `useState`: nút "Xóa bộ lọc" gọi
 * `setSearch("")` để xóa chữ trên ô.
 * `onChange` phải ổn định (như `set` của `useUrlState`), không thì effect chạy lại mỗi lần vẽ.
 */
export function useTableSearch(
  q: string | undefined,
  onChange: (values: { q: string | undefined }) => void,
) {
  const [search, setSearch] = useState(q ?? "");
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    const next = debouncedSearch.trim();
    if ((q ?? "") !== next) onChange({ q: next || undefined });
  }, [debouncedSearch, q, onChange]);

  return [search, setSearch] as const;
}
