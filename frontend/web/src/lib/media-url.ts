import { fileUrl } from "@xom-nho/api/api-client";

/**
 * Đường dẫn ảnh, video của bài (`GET /files/:id`). Trình duyệt gọi thẳng backend và tự gửi cookie phiên
 * (web và backend cùng site), nên không đi qua bộ tối ưu ảnh của Next (máy chủ Next không có cookie).
 */
export function mediaUrl(id: string): string {
  return fileUrl(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000", id);
}
