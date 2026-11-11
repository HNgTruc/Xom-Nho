"use client";

import { useEffect } from "react";
import { browserApi } from "@/lib/browser-api";

const storageKey = (postId: string) => `xom-nho:viewed:${postId}`;

/**
 * Tính một lượt xem khi mở bài, mỗi phiên trình duyệt một lần cho mỗi bài (docs/api.md).
 * Đánh dấu trước khi gọi để React chạy effect hai lần (chế độ dev) cũng chỉ gọi một lần.
 * Lỗi (backend tắt, trình duyệt chặn sessionStorage) bỏ qua: lượt xem không đáng làm phiền người đọc.
 */
export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey(postId))) return;
      sessionStorage.setItem(storageKey(postId), "1");
    } catch {
      return;
    }
    browserApi.posts.view(postId).catch(() => {});
  }, [postId]);

  return null;
}
