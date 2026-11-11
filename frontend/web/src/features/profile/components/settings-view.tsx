import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth";
import { ProfileSettingsForm } from "./profile-settings-form";

/**
 * Trang `/cai-dat` (docs/tinh-nang.md mục 1.4). Kiểm tra phiên ở server: chưa đăng nhập thì sang trang đăng nhập
 * rồi quay lại đây. Quyền thật vẫn do backend quyết (`PATCH /me` cần phiên). Đọc cookie nên nằm trong `<Suspense>`.
 */
export async function SettingsView() {
  const me = await getCurrentUser();
  if (!me) redirect(`/dang-nhap?next=${encodeURIComponent("/cai-dat")}`);

  return (
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
  );
}

export function SettingsViewSkeleton() {
  return (
    <div aria-hidden="true" className="glass-strong flex flex-col gap-4 rounded-xl p-5 sm:p-8">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-5 w-80 max-w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}
