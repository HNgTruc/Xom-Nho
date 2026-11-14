import { useQuery } from "@tanstack/react-query";
import { cn } from "@xom-nho/ui/lib/utils";
import { unseenCountQuery } from "../api/moderation.queries";
import { useLastSeen } from "../lib/last-seen";

/**
 * Số bài chưa xem cạnh mục "Bài mới" trên sidebar (pages/admin.md "Số đếm ở sidebar"): viên `accent`, có nhãn đọc
 * kèm số. Không có bài mới thì không hiện. Thu gọn sidebar thì thành chấm nhỏ góc biểu tượng.
 */
export function UnseenCount({ collapsed = false }: { collapsed?: boolean }) {
  const since = useLastSeen();
  const { data: count } = useQuery(unseenCountQuery(since));
  if (!count) return null;
  const label = `${count} bài chưa xem`;
  const text = count > 99 ? "99+" : String(count);

  return (
    <span
      aria-label={label}
      className={cn(
        "rounded-full bg-accent font-medium text-accent-foreground tabular-nums",
        collapsed
          ? "absolute -top-1 -right-1 min-w-5 px-1 text-center text-xs leading-5"
          : "ml-auto px-2 text-xs leading-5",
      )}
    >
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
