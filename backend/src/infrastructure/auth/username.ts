import { LIMITS, slugify } from "@xom-nho/shared";

// Dùng chung với `usernameSchema` trong shared (kiểm tra `/users/:username`, `?author=`)
const USERNAME_MAX = LIMITS.USERNAME_MAX;
const FALLBACK = "hangxom";

/**
 * Phần gốc của username từ tên (hoặc phần trước @ của email): bỏ dấu, chữ thường, chỉ a-z 0-9.
 * "Trần Thị Đào" → "tranthidao". Không còn ký tự hợp lệ thì "hangxom".
 */
export function toUsernameBase(name: string, email: string): string {
  const fromName = slugify(name).replace(/-/g, "");
  const fromEmail = slugify(email.split("@")[0] ?? "").replace(/-/g, "");
  return (fromName || fromEmail || FALLBACK).slice(0, USERNAME_MAX);
}

/** Username chưa ai dùng: thử gốc trước, trùng thì thêm số 2, 3... (giữ trong giới hạn độ dài). */
export async function generateUsername(
  base: string,
  isTaken: (username: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(base))) return base;
  for (let n = 2; ; n++) {
    const suffix = String(n);
    const candidate = `${base.slice(0, USERNAME_MAX - suffix.length)}${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }
}
