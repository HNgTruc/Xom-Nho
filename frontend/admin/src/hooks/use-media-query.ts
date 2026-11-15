import { useSyncExternalStore } from "react";

/**
 * Khớp media query hay không, theo dõi khi đổi bề rộng cửa sổ. Dùng khi phải đổi **cấu trúc** (khung sửa nằm
 * cạnh danh sách hay mở thành ngăn kéo), không chỉ đổi kiểu: chỉ đổi kiểu thì dùng class `lg:` của Tailwind.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
