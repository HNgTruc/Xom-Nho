import { API_PREFIX } from "../constants/api.js";
import type { ApiResponse } from "../types/api-response.js";
import type { MediaItem } from "../types/media.js";
import type { RequestFn } from "./client.js";

/**
 * Đường dẫn tải một ảnh, video (`GET /files/:id`). Chỉ thành viên xem được: trình duyệt tự gửi cookie phiên
 * (web và backend cùng site), app gửi header Cookie.
 */
export function fileUrl(baseUrl: string, id: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${API_PREFIX}/files/${encodeURIComponent(id)}`;
}

/**
 * Ảnh đại diện để hiện: ảnh tự tải lên (`avatarId`) trước, rồi link bên ngoài (`image`, từ Google, GitHub).
 * Không có cả hai: `null`, frontend hiện chữ cái đầu.
 */
export function avatarUrl(
  baseUrl: string,
  user: { avatarId: string | null; image: string | null },
): string | null {
  if (user.avatarId) return fileUrl(baseUrl, user.avatarId);
  return user.image;
}

export function filesApi(request: RequestFn) {
  return {
    /**
     * `POST /files`: tải một ảnh (JPG, PNG, WebP đến 5 MB) hoặc video (MP4, WebM đến 25 MB) lên, trường `file`.
     * Trả `MediaItem` để gắn vào bài qua `mediaIds`. File sai loại, quá cỡ: ApiError 400.
     */
    upload: (file: Blob, filename = "file", signal?: AbortSignal) => {
      const formData = new FormData();
      formData.append("file", file, filename);
      return request<ApiResponse<MediaItem>>("/files", { method: "POST", formData, signal });
    },
  };
}
