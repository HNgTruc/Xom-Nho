import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, SignOutButton } from "@/features/auth";

/**
 * Phần bên phải header: tên người đang đăng nhập hoặc nút đăng nhập. Đọc cookie nên nằm trong Suspense.
 * Backend không trả lời thì hiện như khách: header có mặt ở mọi trang, không được làm hỏng cả trang.
 */
async function UserNav() {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dang-nhap">Đăng nhập</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/dang-ky">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{user.name}</span>
      <SignOutButton />
    </div>
  );
}

/** Header cố định mỏng 56px (MASTER mục 8). Ô tìm kiếm, nút "Viết bài" thêm ở giai đoạn 3, 4. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-primary">
          Xóm Nhỏ
        </Link>
        <Suspense fallback={<Skeleton className="h-10 w-40" />}>
          <UserNav />
        </Suspense>
      </div>
    </header>
  );
}
