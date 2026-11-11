import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, UserMenu } from "@/features/auth";
import { MessagesMenu } from "@/features/messages";
import { NotificationsMenu } from "@/features/notifications";
import { CategoryNav, CategoryNavSkeleton } from "@/features/posts";
import { HeaderSearch } from "@/features/search";

/** Nút cho khách: chỉ đăng nhập, đăng ký (ADR 0007). Nằm cột cuối của lưới header. */
function GuestActions() {
  return (
    <div className="flex items-center gap-1 justify-self-end lg:col-start-3">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dang-nhap">Đăng nhập</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/dang-ky">Đăng ký</Link>
      </Button>
    </div>
  );
}

/**
 * Header của thành viên: điều hướng danh mục, rồi ô tìm kiếm, nút Tin nhắn, Thông báo, menu tài khoản (như Facebook).
 * Đọc cookie nên nằm trong Suspense. Phiên hết hạn hay backend không trả lời thì hiện như khách
 * (không có danh mục): header có mặt ở mọi trang, không được làm hỏng cả trang.
 */
async function MemberNav() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return <GuestActions />;

  return (
    <>
      <div className="col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:row-start-auto">
        <Suspense fallback={<CategoryNavSkeleton />}>
          <CategoryNav />
        </Suspense>
      </div>
      <div className="flex items-center gap-2 justify-self-end">
        <HeaderSearch />
        <MessagesMenu />
        <NotificationsMenu />
        <UserMenu user={{ name: user.name, username: user.username, image: user.image }} />
      </div>
    </>
  );
}

function MemberNavSkeleton() {
  return (
    <>
      <div className="col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:row-start-auto">
        <CategoryNavSkeleton />
      </div>
      <Skeleton className="h-10 w-40 justify-self-end rounded-full" />
    </>
  );
}

/**
 * Header dính trong khung kính (MASTER mục 8): thanh `glass-bar` dạng viên thuốc gồm logo, điều hướng
 * danh mục, nút người dùng. Dưới 1024px: điều hướng xuống hàng thứ hai và cuộn ngang bên trong thanh.
 * `guest`: trang của khách (chào mừng) chỉ có logo, Đăng nhập, Đăng ký; không đọc cookie nên dựng sẵn được.
 */
export function SiteHeader({ guest = false }: { guest?: boolean }) {
  return (
    <header className="sticky top-2 z-20 px-2 pt-2 sm:top-4 sm:px-4 sm:pt-4">
      <div className="glass-bar relative grid animate-rise-in grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 rounded-xl p-1.5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:rounded-full">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full border border-input/50 px-4 text-base font-bold tracking-tight text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Xóm Nhỏ
        </Link>

        {guest ? (
          <GuestActions />
        ) : (
          <Suspense fallback={<MemberNavSkeleton />}>
            <MemberNav />
          </Suspense>
        )}
      </div>
    </header>
  );
}
