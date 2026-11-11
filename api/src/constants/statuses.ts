/** Trạng thái bài viết, trùng enum `PostStatus` trong Prisma. Luồng chuyển: docs/phan-quyen.md. */
export const POST_STATUSES = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PostStatus = (typeof POST_STATUSES)[keyof typeof POST_STATUSES];

export const POST_STATUS_VALUES = Object.values(POST_STATUSES) as [PostStatus, ...PostStatus[]];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  PUBLISHED: "Đã đăng",
  REJECTED: "Bị từ chối",
  ARCHIVED: "Đã ẩn",
};

/** Trạng thái bình luận, trùng enum `CommentStatus` trong Prisma. */
export const COMMENT_STATUSES = {
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN",
} as const;

export type CommentStatus = (typeof COMMENT_STATUSES)[keyof typeof COMMENT_STATUSES];

export const COMMENT_STATUS_VALUES = Object.values(COMMENT_STATUSES) as [
  CommentStatus,
  ...CommentStatus[],
];

export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  VISIBLE: "Đang hiện",
  HIDDEN: "Đã ẩn",
};
