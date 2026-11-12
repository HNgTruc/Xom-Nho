import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { requireUser } from "@/features/auth";
import { userAvatarSrc } from "@/lib/media-url";
import { AvatarSettings } from "./avatar-settings";
import { ProfileSettingsForm } from "./profile-settings-form";

/**
 * Trang `/cai-dat` (docs/tinh-nang.md mục 1.4). Kiểm tra phiên ở server: chưa đăng nhập thì sang trang đăng nhập
 * rồi quay lại đây. Quyền thật vẫn do backend quyết (`PATCH /me`, `PUT /me/avatar` cần phiên). Đọc cookie nên
 * nằm trong `<Suspense>`.
 */
export async function SettingsView() {
  const me = await requireUser("/cai-dat");

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-labelledby="settings-avatar"
        className="glass-strong flex flex-col gap-5 rounded-xl p-5 sm:p-8"
      >
        <h2 id="settings-avatar" className="text-xl font-semibold">
          Ảnh đại diện
        </h2>
        <AvatarSettings name={me.name} initialSrc={userAvatarSrc(me)} />
      </section>

      <section
        aria-labelledby="settings-profile"
        className="glass-strong flex flex-col gap-6 rounded-xl p-5 sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <h2 id="settings-profile" className="text-xl font-semibold">
            Thông tin hồ sơ
          </h2>
          <p className="text-sm text-muted-foreground">
            Hàng xóm sẽ thấy tên và giới thiệu này trên hồ sơ của bạn.
          </p>
        </div>
        <ProfileSettingsForm initial={{ name: me.name, bio: me.bio ?? "" }} />
      </section>
    </div>
  );
}

export function SettingsViewSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="glass-strong flex flex-col gap-5 rounded-xl p-5 sm:p-8">
        <Skeleton className="h-7 w-40" />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="h-5 w-72 max-w-full" />
          </div>
        </div>
      </div>
      <div className="glass-strong flex flex-col gap-4 rounded-xl p-5 sm:p-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </div>
  );
}
