import type { PostDetail } from "@xom-nho/shared";
import { isApiError } from "@xom-nho/shared/api-client";
import { publicApi, serverApi } from "@/lib/server-api";

function nullOn404(error: unknown): null {
  if (isApiError(error) && error.status === 404) return null;
  throw error;
}

/**
 * Chi tiết bài cho người đang xem (gửi cookie): tác giả và trưởng xóm thấy được bài chưa đăng.
 * Không có hoặc không được xem thì `null` (trang gọi `notFound()`); lỗi khác ném tiếp.
 */
export function getPost(slug: string): Promise<PostDetail | null> {
  return serverApi.posts.get(slug).then((res) => res.data, nullOn404);
}

/**
 * Bài nhìn từ phía khách (không gửi cookie), cho thẻ meta và Open Graph: tiêu đề bản nháp không lọt vào
 * thẻ meta, và máy chủ mạng xã hội (không có phiên) cũng thấy đúng như vậy.
 */
export function getPublicPost(slug: string): Promise<PostDetail | null> {
  return publicApi.posts.get(slug).then((res) => res.data, nullOn404);
}
