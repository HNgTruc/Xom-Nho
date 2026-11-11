import { formatDate, type PublicProfile, ROLE_LABELS } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import type { ReactNode } from "react";
import { initials } from "@/lib/initials";

const numberFormat = new Intl.NumberFormat("vi-VN");

/**
 * Đầu trang hồ sơ (docs/tinh-nang.md mục 1.3): ảnh bìa, ảnh đại diện, tên, vai trò, giới thiệu, ngày tham gia,
 * số bài. Ảnh bìa, nơi ở, số bạn bè, nút Kết bạn thêm ở giai đoạn 4b; giờ ảnh bìa là nền mặc định.
 * `actions`: nút của chủ hồ sơ (đọc cookie nên trang truyền vào trong `<Suspense>`).
 */
export function ProfileHeader({
  profile,
  actions,
}: {
  profile: PublicProfile;
  actions?: ReactNode;
}) {
  return (
    <header className="glass animate-rise-in overflow-hidden rounded-xl">
      {/* Ảnh bìa mặc định: dải màu nhấn, trang trí */}
      <div
        aria-hidden="true"
        className="h-28 bg-linear-to-br from-accent via-glass-strong to-secondary/25 sm:h-40"
      />

      <div className="flex flex-col gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
          <Avatar className="size-24 border-4 border-card text-2xl font-semibold shadow-glass sm:size-28">
            {profile.image && <AvatarImage src={profile.image} alt="" />}
            <AvatarFallback className="text-3xl">{initials(profile.name)}</AvatarFallback>
          </Avatar>
          {actions}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold md:text-3xl">{profile.name}</h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {profile.username && <span>@{profile.username}</span>}
            <span className="inline-flex h-6 items-center rounded-full bg-accent px-2.5 font-medium text-accent-foreground">
              {ROLE_LABELS[profile.role]}
            </span>
          </p>
        </div>

        {profile.bio && <p className="text-base whitespace-pre-line">{profile.bio}</p>}

        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <dt>Tham gia</dt>
            <dd className="font-medium text-foreground">
              <time dateTime={profile.createdAt}>{formatDate(profile.createdAt)}</time>
            </dd>
          </div>
          <div className="flex gap-1">
            <dd className="font-medium text-foreground tabular-nums">
              {numberFormat.format(profile.postCount)}
            </dd>
            <dt>bài viết</dt>
          </div>
        </dl>
      </div>
    </header>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="glass overflow-hidden rounded-xl">
      <Skeleton className="h-28 rounded-none sm:h-40" />
      <div className="flex flex-col gap-3 px-5 pb-5 sm:px-6">
        <Skeleton className="-mt-12 size-24 rounded-full border-4 border-card sm:size-28" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
    </div>
  );
}
