import { useEffect, useState } from "react";

/**
 * Giờ hiện tại để định dạng "3 phút trước", "14:05 hôm qua", cập nhật mỗi phút. Không gọi `new Date()` thẳng khi
 * vẽ: mỗi lần vẽ lại sẽ ra giờ khác, chữ nhảy lung tung (quy tắc `react/purity`).
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
