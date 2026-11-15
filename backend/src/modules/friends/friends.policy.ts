import { RELATIONSHIP_STATUSES, type RelationshipStatus } from "@xom-nho/api";

/**
 * Những gì đã biết về quan hệ giữa người đang xem và một hàng xóm, lấy từ database. Policy chỉ suy ra từ đây,
 * không gọi database (docs/phan-quyen.md mục "Bạn bè và chặn").
 */
export interface RelationshipFacts {
  viewerId: string;
  targetId: string;
  /** Người kia đang bị cấm (`isBanned`, cấm đã hết hạn thì không tính) */
  targetBanned: boolean;
  /** Dòng `friendship` của cặp, `null` khi chưa có quan hệ */
  friendship: { requesterId: string; status: "PENDING" | "ACCEPTED" } | null;
  blockedByMe: boolean;
  blockedByThem: boolean;
}

/**
 * Quyền kết bạn, chặn. Vai trò không ảnh hưởng: hàng xóm, cây bút, trưởng xóm có cùng quyền. Người đang bị cấm
 * đã bị AuthGuard chặn trước khi tới đây.
 */
export const FriendsPolicy = {
  /** Quan hệ nhìn từ phía người đang xem. */
  status(facts: RelationshipFacts): RelationshipStatus {
    if (facts.viewerId === facts.targetId) return RELATIONSHIP_STATUSES.SELF;
    const { friendship } = facts;
    if (!friendship) return RELATIONSHIP_STATUSES.NONE;
    if (friendship.status === "ACCEPTED") return RELATIONSHIP_STATUSES.FRIENDS;
    return friendship.requesterId === facts.viewerId
      ? RELATIONSHIP_STATUSES.OUTGOING
      : RELATIONSHIP_STATUSES.INCOMING;
  },

  /**
   * Gửi lời mời (chưa có quan hệ) hoặc chấp nhận (người kia đã mời): người kia không bị cấm và không có lượt
   * chặn ở chiều nào. Đã là bạn hay đã mời rồi thì không còn gì để bấm.
   */
  canRequest(facts: RelationshipFacts): boolean {
    const status = FriendsPolicy.status(facts);
    if (status !== RELATIONSHIP_STATUSES.NONE && status !== RELATIONSHIP_STATUSES.INCOMING) {
      return false;
    }
    return !facts.targetBanned && !facts.blockedByMe && !facts.blockedByThem;
  },

  /** Chặn, bỏ chặn: ai cũng được, kể cả trưởng xóm, trừ chính mình. */
  canBlock(viewerId: string, targetId: string): boolean {
    return viewerId !== targetId;
  },
};
