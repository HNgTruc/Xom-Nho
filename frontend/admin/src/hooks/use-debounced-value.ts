import { useEffect, useState } from "react";

/** Giá trị trễ `delay` ms sau lần đổi cuối: ô tìm của bảng chỉ gửi yêu cầu khi người dùng ngừng gõ (300ms). */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
