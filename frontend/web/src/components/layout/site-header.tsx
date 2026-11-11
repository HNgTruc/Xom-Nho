import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, UserMenu } from "@/features/auth";
import { CategoryNav, CategoryNavSkeleton } from "@/features/posts";

/**
 * Phần bên phải header: menu tài khoản (đã đăng nhập) hoặc nút đăng nhập. Đọc cookie nên nằm trong Suspense.
 * Backend không trả lời thì hiện như khách: header có mặt ở mọi trang, không được làm hỏng cả trang.
 */
async function UserNav() {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dang-nhap">Đăng nhập</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/dang-ky">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  return <UserMenu user={{ name: user.name, username: user.username, image: user.image }} />;
}

/**
 * Header dính trong khung kính (MASTER mục 8): thanh `glass-bar` dạng viên thuốc gồm logo, điều hướng
 * danh mục, nút người dùng. Dưới 1024px: điều hướng xuống hàng thứ hai và cuộn ngang bên trong thanh.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-2 z-20 px-2 pt-2 sm:top-4 sm:px-4 sm:pt-4">
      <div className="glass-bar grid animate-rise-in grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1 rounded-xl p-1.5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:rounded-full">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full border border-input/50 px-4 text-base font-bold tracking-tight text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Xóm Nhỏ
        </Link>

        <div className="col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:row-start-auto">
          <Suspense fallback={<CategoryNavSkeleton />}>
            <CategoryNav />
          </Suspense>
        </div>

        <div className="justify-self-end">
          <Suspense fallback={<Skeleton className="h-10 w-40 rounded-full" />}>
            <UserNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
