/** Cách sắp xếp danh sách bài (`GET /posts?sort=`). */
export const POST_SORTS = {
  /** Mới đăng trước */
  NEW: "new",
  /** Nhiều lượt xem trước */
  TOP: "top",
} as const;

export type PostSort = (typeof POST_SORTS)[keyof typeof POST_SORTS];

export const POST_SORT_VALUES = Object.values(POST_SORTS) as [PostSort, ...PostSort[]];

/** Nhãn tab trên trang chủ */
export const POST_SORT_LABELS: Record<PostSort, string> = {
  new: "Mới",
  top: "Nhiều người đọc",
};
