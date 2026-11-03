import { getCurrentUser } from "../api/get-current-user";

/**
 * Lời chào trên trang chủ theo người đang xem (câu mẫu ở docs/giong-van-va-giao-dien.md). Đọc cookie nên phải
 * nằm trong `<Suspense>`. Backend không trả lời thì chào như khách: lời chào không được làm hỏng trang.
 */
export async function HomeGreeting() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <p className="text-base text-muted-foreground">
      {user
        ? `Chào ${user.name}, hôm nay xóm có gì mới nè.`
        : "Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện."}
    </p>
  );
}
