import type { MediaKind } from "../constants/media.js";

/**
 * Ảnh hoặc video (`POST /files` trả về, gắn trong bài). Đường dẫn tải file: `fileUrl(baseUrl, id)`
 * (`GET /files/:id`, chỉ thành viên xem được).
 */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  mimeType: string;
}
