/**
 * Khóa của một cặp trong bảng `friendship` (docs/co-so-du-lieu.md): mỗi cặp một dòng, id nhỏ hơn đứng trước.
 *
 * So sánh bằng `<` của JavaScript (theo mã UTF-16), KHÔNG theo collation MySQL: `utf8mb4_unicode_ci` không
 * phân biệt hoa thường, còn id của Better Auth có cả chữ hoa lẫn thường. Mọi chỗ ghi hay đọc `friendship`
 * theo cặp phải đi qua hàm này, kể cả seed, để không bao giờ có hai dòng (A, B) và (B, A).
 */
export function orderFriendPair(a: string, b: string): { userLowId: string; userHighId: string } {
  if (a === b) throw new Error("Không ghép cặp bạn bè một người với chính mình");
  return a < b ? { userLowId: a, userHighId: b } : { userLowId: b, userHighId: a };
}
