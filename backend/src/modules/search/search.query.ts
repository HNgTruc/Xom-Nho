import { toSearchText } from "@xom-nho/shared";

/**
 * Đổi từ khóa người dùng gõ thành biểu thức `MATCH ... AGAINST (... IN BOOLEAN MODE)`: mọi từ đều phải có.
 * "Bàn tròn!" thành "+ban +tron". Trả `null` nếu không còn từ nào (không cần truy vấn).
 *
 * `searchText` chỉ gồm a-z, 0-9 sau khi bỏ dấu, nên mọi ký tự khác (kể cả toán tử boolean
 * `+ - < > ( ) ~ * " @`) đều được đổi thành khoảng trắng: người dùng không chèn được toán tử.
 */
export function toBooleanQuery(q: string): string | null {
  const words = toSearchText(q)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return null;
  return [...new Set(words)].map((word) => `+${word}`).join(" ");
}
