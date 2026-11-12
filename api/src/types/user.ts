import type { Role } from "../constants/roles.js";

/**
 * Người viết bài, bình luận: đủ để hiện tên, ảnh, liên kết `/u/<username>`.
 * `id` để frontend so với `Me.id` (hiện nút "Sửa" cho chính tác giả). Không bao giờ có `email`.
 */
export interface UserSummary {
  id: string;
  name: string;
  username: string | null;
  /** Link ảnh bên ngoài (Google, GitHub). Hiện ảnh bằng `avatarUrl(baseUrl, user)`, đừng dùng thẳng */
  image: string | null;
  /** Ảnh đại diện tự tải lên (`PUT /me/avatar`), ưu tiên hơn `image` */
  avatarId: string | null;
}

/**
 * `GET /users/:username`: hồ sơ công khai. Bài của người này lấy bằng `GET /posts?author=<username>`.
 * Không có `email` và thông tin cấm.
 */
export interface PublicProfile extends UserSummary {
  bio: string | null;
  /** Để hiện nhãn "Cây bút", "Trưởng xóm" */
  role: Role;
  /** Ngày tham gia, ISO 8601 */
  createdAt: string;
  /** Số bài đã đăng */
  postCount: number;
}
