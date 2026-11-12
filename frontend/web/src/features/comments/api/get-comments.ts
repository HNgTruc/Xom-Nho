import type { CommentThread } from "@xom-nho/api";
import { serverApi } from "@/lib/server-api";

/**
 * Các nhánh bình luận của bài cho người đang xem (gửi cookie: trưởng xóm nhận cả bình luận đã ẩn).
 * Lỗi thì `null` để khối bình luận báo lỗi riêng, bài vẫn đọc được.
 */
export async function getComments(postId: string): Promise<CommentThread[] | null> {
  try {
    return (await serverApi.comments.list(postId)).data;
  } catch {
    return null;
  }
}
