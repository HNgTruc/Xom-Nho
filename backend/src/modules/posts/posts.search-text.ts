import { toSearchText } from "@xom-nho/api";

export interface PostSearchTextSource {
  title: string;
  /** Tóm tắt cuối cùng sẽ lưu (đã tự lấy từ nội dung nếu tác giả để trống) */
  excerpt: string;
  tagNames: readonly string[];
}

/**
 * Giá trị cột `Post.searchText`: tiêu đề + tóm tắt + tên tag, bỏ dấu, chữ thường (xem docs/co-so-du-lieu.md).
 * Nơi DUY NHẤT tạo giá trị này. Phải gọi lại khi đổi bất kỳ phần nào:
 * - tạo, sửa bài (tiêu đề, tóm tắt, danh sách tag);
 * - admin gộp hoặc xóa tag: tính lại cho mọi bài gắn tag đó, trong cùng transaction.
 */
export function buildPostSearchText({ title, excerpt, tagNames }: PostSearchTextSource): string {
  return toSearchText([title, excerpt, ...tagNames].join(" "));
}
