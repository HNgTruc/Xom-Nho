import type { RelationshipStatus } from "../constants/friendship.js";
import type { UserSummary } from "./user.js";

/**
 * Quan hệ giữa người đang xem và một hàng xóm (`PublicProfile.relationship`, docs/api.md mục "Bạn bè, chặn").
 * Không có trường "người kia chặn mình": khi đó chỉ thấy `canRequest: false`.
 */
export interface Relationship {
  /** Gặp giá trị lạ thì dùng `toRelationshipStatus` (về `none`) và ẩn nút */
  status: RelationshipStatus;
  /** Mình đang chặn người này (hiện "Bỏ chặn" thay cho "Kết bạn") */
  blockedByMe: boolean;
  /**
   * Nút Kết bạn (gửi lời mời hoặc chấp nhận) bấm được: `status` là `none` hay `incoming`, người kia không bị cấm,
   * không có lượt chặn ở chiều nào. Chỉ để ẩn, hiện nút; backend kiểm tra lại.
   */
  canRequest: boolean;
}

/** Kết quả `PUT`/`DELETE /friends/:userId` và `/blocks/:userId`: trạng thái SAU thao tác. */
export interface FriendshipState {
  relationship: Relationship;
  /** Số bạn của người kia, để trang hồ sơ cập nhật số mà không tải lại */
  friendCount: number;
}

/** `GET /friends`: một người bạn. */
export interface FriendItem {
  user: UserSummary;
  /** Lúc thành bạn, ISO 8601 */
  since: string;
}

/** `GET /friends/requests`: `user` là người kia (người gửi với `incoming`, người nhận với `outgoing`). */
export interface FriendRequestItem {
  user: UserSummary;
  /** Lúc gửi lời mời, ISO 8601 */
  createdAt: string;
}

/** `GET /blocks`: một người mình đã chặn. */
export interface BlockedItem {
  user: UserSummary;
  /** ISO 8601 */
  blockedAt: string;
}
