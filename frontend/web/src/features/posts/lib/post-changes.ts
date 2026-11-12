import type { PostDetail, UpdatePostInput } from "@xom-nho/api";

/** Những gì đang có trong hộp soạn bài: dùng chung cho đăng bài và sửa bài. */
export interface PostEditorValues {
  title: string;
  content: string;
  /** Slug danh mục */
  category: string;
  /** Id ảnh, video theo thứ tự hiển thị */
  mediaIds: string[];
}

/** Giá trị ban đầu của hộp soạn khi sửa một bài. */
export function postEditorValues(post: PostDetail): PostEditorValues {
  return {
    title: post.title,
    content: post.content,
    category: post.category.slug,
    mediaIds: post.media.map((item) => item.id),
  };
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Body cho `PATCH /posts/:id`: chỉ những trường đã đổi so với lúc mở hộp (docs/api.md, mục "Sửa, xóa bài").
 * Tiêu đề, nội dung so sau khi bỏ khoảng trắng hai đầu (schema cũng bỏ), nên thêm dấu cách thừa không tính là sửa.
 * `mediaIds` gửi cả danh sách khi thêm, gỡ hay đổi thứ tự. Không đổi gì thì trả `{}`.
 */
export function postChanges(initial: PostEditorValues, current: PostEditorValues): UpdatePostInput {
  const changes: UpdatePostInput = {};
  if (current.title.trim() !== initial.title.trim()) changes.title = current.title;
  if (current.content.trim() !== initial.content.trim()) changes.content = current.content;
  if (current.category !== initial.category) changes.category = current.category;
  if (!sameList(current.mediaIds, initial.mediaIds)) changes.mediaIds = current.mediaIds;
  return changes;
}

export function hasChanges(changes: UpdatePostInput): boolean {
  return Object.keys(changes).length > 0;
}
