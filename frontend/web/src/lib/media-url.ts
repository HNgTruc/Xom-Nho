import { avatarUrl, fileUrl } from "@xom-nho/api/api-client";
import { PUBLIC_API_URL } from "./env";

/**
 * Đường dẫn ảnh, video của bài (`GET /files/:id`). Trình duyệt gọi thẳng backend và tự gửi cookie phiên
 * (web và backend cùng site), nên không đi qua bộ tối ưu ảnh của Next (máy chủ Next không có cookie).
 */
export function mediaUrl(id: string): string {
  return fileUrl(PUBLIC_API_URL, id);
}

/** Ảnh đại diện để hiện: ảnh tự tải lên trước, rồi ảnh Google/GitHub; không có thì `null` (hiện chữ cái đầu). */
export function userAvatarSrc(user: {
  avatarId: string | null;
  image: string | null;
}): string | null {
  return avatarUrl(PUBLIC_API_URL, user);
}
