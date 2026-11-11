import type { PostDetail } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { cache } from "react";
import { serverApi } from "@/lib/server-api";

function nullOn404(error: unknown): null {
  if (isApiError(error) && error.status === 404) return null;
  throw error;
}

/**
 * Chi tiết bài cho người đang xem (gửi cookie): tác giả và trưởng xóm thấy được bài chưa đăng.
 * `cache` để `generateMetadata` và trang dùng chung một lần gọi.
 * Không có hoặc không được xem thì `null` (trang gọi `notFound()`); lỗi khác ném tiếp.
 */
export const getPost = cache((slug: string): Promise<PostDetail | null> =>
  serverApi.posts.get(slug).then((res) => res.data, nullOn404),
);
