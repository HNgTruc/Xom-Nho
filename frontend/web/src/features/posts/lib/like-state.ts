import { DISLIKE_MESSAGES, ERROR_CODES, LIKE_MESSAGES, type PostLikeState } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";

/** Số không xuống dưới 0 khi dữ liệu lệch. */
const minusOne = (count: number) => Math.max(0, count - 1);

/**
 * Trạng thái hiện ngay khi bấm Thích (cập nhật lạc quan, docs/tinh-nang.md mục 2.6): đảo `liked`, số thích cộng
 * hoặc trừ một. Thích và Không thích loại trừ nhau (ADR 0009): đang Không thích thì gỡ luôn, số không thích trừ
 * một. Gửi đi là `PUT` hay `DELETE` theo `liked` của kết quả, không nhờ backend đảo.
 */
export function toggledLike(state: PostLikeState): PostLikeState {
  if (state.liked) return { ...state, liked: false, likeCount: minusOne(state.likeCount) };
  return {
    liked: true,
    likeCount: state.likeCount + 1,
    disliked: false,
    dislikeCount: state.disliked ? minusOne(state.dislikeCount) : state.dislikeCount,
  };
}

/** Như `toggledLike` cho nút Không thích: đảo `disliked`, đang Thích thì gỡ Thích. */
export function toggledDislike(state: PostLikeState): PostLikeState {
  if (state.disliked) {
    return { ...state, disliked: false, dislikeCount: minusOne(state.dislikeCount) };
  }
  return {
    liked: false,
    likeCount: state.liked ? minusOne(state.likeCount) : state.likeCount,
    disliked: true,
    dislikeCount: state.dislikeCount + 1,
  };
}

/**
 * Câu báo khi bấm Thích, Không thích không thành. Bấm nhanh quá, bài đang ẩn: dùng câu cụ thể của backend.
 * Còn lại (mất mạng, bài đã bị xóa, lỗi máy chủ): câu "chưa lưu được" của đúng nút đã bấm.
 */
export function likeErrorText(error: unknown, kind: "like" | "dislike" = "like"): string {
  if (
    isApiError(error) &&
    (error.code === ERROR_CODES.RATE_LIMITED || error.code === ERROR_CODES.FORBIDDEN)
  ) {
    return error.message;
  }
  return kind === "dislike" ? DISLIKE_MESSAGES.FAILED : LIKE_MESSAGES.FAILED;
}

/** Hai trạng thái có khác nhau không (để biết server vừa gửi số mới sau `router.refresh()`). */
export function sameLikeState(a: PostLikeState, b: PostLikeState): boolean {
  return (
    a.liked === b.liked &&
    a.likeCount === b.likeCount &&
    a.disliked === b.disliked &&
    a.dislikeCount === b.dislikeCount
  );
}
