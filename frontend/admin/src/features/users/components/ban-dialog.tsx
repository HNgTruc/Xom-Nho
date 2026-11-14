import { type AdminUserListItem, formatDateTime, LIMITS } from "@xom-nho/api";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Segmented } from "@/components/common/segmented";
import { useNow } from "@/hooks/use-now";

type Duration = "1d" | "7d" | "30d" | "forever";
const DAYS: Record<Exclude<Duration, "forever">, number> = { "1d": 1, "7d": 7, "30d": 30 };
const OPTIONS: { value: Duration; label: string }[] = [
  { value: "1d", label: "1 ngày" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "forever", label: "Vĩnh viễn" },
];

function expiresFrom(duration: Duration, now: Date): Date | null {
  return duration === "forever"
    ? null
    : new Date(now.getTime() + DAYS[duration] * 24 * 60 * 60 * 1000);
}

/**
 * Hộp cấm tài khoản (pages/admin.md "Thành viên", bản thiết kế "Thành viên"): thời hạn 1 ngày, 7 ngày, 30 ngày,
 * vĩnh viễn (ghi rõ giờ hết hạn), lý do bắt buộc; nút "Cấm tài khoản" màu `destructive` khóa đến khi có lý do.
 * Người bị cấm thấy lý do khi đăng nhập lại ("Tài khoản của bạn đã bị khóa. Lý do: ...").
 */
export function BanDialog({
  user,
  onOpenChange,
  onConfirm,
}: {
  user: AdminUserListItem | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: { reason: string; expiresAt: string | null }) => Promise<unknown>;
}) {
  const now = useNow();
  const [duration, setDuration] = useState<Duration>("7d");
  const expires = expiresFrom(duration, now);

  return (
    <ConfirmDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) setDuration("7d");
        onOpenChange(open);
      }}
      title={`Cấm tài khoản ${user?.name ?? ""}?`}
      description={`${user?.name ?? "Người này"} bị đăng xuất ngay và không đăng nhập được đến khi hết hạn. Bài viết, bình luận cũ vẫn còn; muốn ẩn thì làm ở mục Bài viết, Bình luận.`}
      confirmLabel="Cấm tài khoản"
      destructive
      reason={{
        label: "Lý do",
        hint: "bắt buộc, người bị cấm thấy khi đăng nhập lại",
        maxLength: LIMITS.MODERATION_REASON_MAX,
      }}
      onConfirm={(reason) =>
        // Tính hạn lúc bấm (không dùng giờ lúc mở hộp): backend từ chối hạn đã qua
        onConfirm({ reason, expiresAt: expiresFrom(duration, new Date())?.toISOString() ?? null })
      }
    >
      <div className="flex flex-col gap-2">
        <Segmented label="Thời hạn cấm" value={duration} options={OPTIONS} onChange={setDuration} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {expires
            ? `Hết cấm lúc ${formatDateTime(expires, now)}.`
            : "Không tự hết hạn: phải bỏ cấm bằng tay."}
        </p>
      </div>
    </ConfirmDialog>
  );
}
