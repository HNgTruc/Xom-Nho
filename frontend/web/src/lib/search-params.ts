import type { z } from "zod";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** `?a=1&a=2` thì lấy giá trị đầu, như cách trình duyệt điền form. */
function firstValues(raw: RawSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) result[key] = first;
  }
  return result;
}

/**
 * Đọc query của URL bằng schema trong `shared`, kiểu dễ dãi: trường nào sai thì bỏ trường đó (về mặc định),
 * các trường đúng vẫn giữ. `?sort=top&page=abc` thành trang 1, sắp theo lượt đọc, thay vì trang lỗi.
 */
export function parseSearchParams<T extends z.ZodType>(
  schema: T,
  raw: RawSearchParams,
): z.output<T> {
  const values = firstValues(raw);
  const first = schema.safeParse(values);
  if (first.success) return first.data;

  for (const issue of first.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") delete values[key];
  }
  const second = schema.safeParse(values);
  // Schema query trong shared đều có mặc định cho mọi trường, nên object rỗng luôn hợp lệ
  return second.success ? second.data : schema.parse({});
}
