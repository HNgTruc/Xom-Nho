import { useSyncExternalStore } from "react";

/**
 * Mốc "lần xem trước" của màn Bài mới (pages/admin.md, chốt 2026-11-14): lưu `localStorage` của app admin, mỗi máy
 * một mốc. Chỉ dời khi bấm "Đánh dấu đã xem hết" (cách chắc chắn: không bao giờ sót bài chưa đọc). Chưa có mốc
 * (máy mới) thì mặc định 24 giờ trước lúc mở app. Sidebar (số bài chưa xem) và màn Bài mới cùng đọc qua đây nên
 * đổi mốc ở màn này thì số trên sidebar cập nhật ngay.
 */
const KEY = "xom-nho-admin:posts-last-seen";
const EVENT = "xom-nho-admin:posts-last-seen-change";

/** Mặc định tính một lần lúc tải app, để khóa query ổn định (không đổi mỗi lần vẽ). */
const FALLBACK = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

function read(): string {
  try {
    const value = window.localStorage.getItem(KEY);
    return value && !Number.isNaN(Date.parse(value)) ? value : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Dời mốc tới `value` (ISO 8601), báo cho mọi chỗ đang hiện mốc, kể cả tab khác. */
export function markAllSeen(value = new Date().toISOString()): void {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // không lưu được thì chỉ có tác dụng trong lần xem này
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Mốc hiện tại (ISO 8601). */
export function useLastSeen(): string {
  return useSyncExternalStore(subscribe, read, () => FALLBACK);
}
