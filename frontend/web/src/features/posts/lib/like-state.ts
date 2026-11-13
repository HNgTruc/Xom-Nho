import { ERROR_CODES, LIKE_MESSAGES, type PostLikeState } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";

/**
 * Trạng thái hiện ngay khi bấm Thích (cập nhật lạc quan, docs/tinh-nang.md mục 2.6): đảo `liked`, số thích cộng
 * hoặc trừ một, không xuống dưới 0. Gửi đi là `PUT` hay `DELETE` theo `liked` của kết quả, không nhờ backend đảo.
 */
export function toggledLike(state: PostLikeState): PostLikeState {
  return state.liked
    ? { liked: false, likeCount: Math.max(0, state.likeCount - 1) }
    : { liked: true, likeCount: state.likeCount + 1 };
}

/**
 * Câu báo khi thích, bỏ thích không thành. Bấm nhanh quá, bài đang ẩn: dùng câu cụ thể của backend.
 * Còn lại (mất mạng, bài đã bị xóa, lỗi máy chủ): `LIKE_MESSAGES.FAILED`.
 */
export function likeErrorText(error: unknown): string {
  if (
    isApiError(error) &&
    (error.code === ERROR_CODES.RATE_LIMITED || error.code === ERROR_CODES.FORBIDDEN)
  ) {
    return error.message;
  }
  return LIKE_MESSAGES.FAILED;
}
