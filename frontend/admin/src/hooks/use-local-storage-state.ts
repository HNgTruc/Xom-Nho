import { useCallback, useState } from "react";

/**
 * State nhỏ của riêng người xem nhớ qua `localStorage` (sidebar thu gọn, mốc "lần xem trước" của màn Bài mới).
 * Bộ nhớ bị chặn (trình duyệt riêng tư) hay dữ liệu hỏng thì dùng giá trị mặc định, không làm vỡ trang.
 */
export function useLocalStorageState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // không lưu được thì vẫn dùng cho lần xem này
      }
    },
    [key],
  );

  return [value, update];
}
