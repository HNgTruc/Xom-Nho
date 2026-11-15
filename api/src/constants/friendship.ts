/**
 * Quan hệ giữa người đang xem và một hàng xóm (`Relationship.status`, docs/api.md mục "Bạn bè, chặn").
 * Client gặp giá trị lạ (bản backend mới hơn) thì coi như `none` và ẩn nút: dùng `toRelationshipStatus`.
 */
export const RELATIONSHIP_STATUSES = {
  /** Hồ sơ của chính mình */
  SELF: "self",
  NONE: "none",
  /** Mình đã gửi lời mời, chờ người kia */
  OUTGOING: "outgoing",
  /** Người kia đã mời mình */
  INCOMING: "incoming",
  FRIENDS: "friends",
} as const;

export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[keyof typeof RELATIONSHIP_STATUSES];

export const RELATIONSHIP_STATUS_VALUES = Object.values(RELATIONSHIP_STATUSES) as [
  RelationshipStatus,
  ...RelationshipStatus[],
];

export function toRelationshipStatus(value: string): RelationshipStatus {
  return (RELATIONSHIP_STATUS_VALUES as readonly string[]).includes(value)
    ? (value as RelationshipStatus)
    : RELATIONSHIP_STATUSES.NONE;
}

/** `GET /friends/requests?direction=`: lời mời nhận được hay đã gửi. */
export const FRIEND_REQUEST_DIRECTIONS = {
  INCOMING: "incoming",
  OUTGOING: "outgoing",
} as const;

export type FriendRequestDirection =
  (typeof FRIEND_REQUEST_DIRECTIONS)[keyof typeof FRIEND_REQUEST_DIRECTIONS];

export const FRIEND_REQUEST_DIRECTION_VALUES = Object.values(FRIEND_REQUEST_DIRECTIONS) as [
  FriendRequestDirection,
  ...FriendRequestDirection[],
];
