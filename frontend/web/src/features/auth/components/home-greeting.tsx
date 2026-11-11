import { requireUser } from "../api/get-current-user";

/**
 * Lời chào trên trang chủ của thành viên (câu mẫu ở docs/giong-van-va-giao-dien.md). Đọc cookie nên phải
 * nằm trong `<Suspense>`. Khách không tới được đây (`proxy.ts` cho xem trang chào mừng); cookie còn mà phiên
 * đã hết hay bị khóa thì sang trang đăng nhập.
 */
export async function HomeGreeting() {
  const user = await requireUser("/");
  return (
    <p className="text-base text-muted-foreground">{`Chào ${user.name}, hôm nay xóm có gì mới nè.`}</p>
  );
}
