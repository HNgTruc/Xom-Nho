import { useQuery } from "@tanstack/react-query";
import { ROLES, safeNext } from "@xom-nho/api";
import { LogoMark } from "@xom-nho/ui/components/logo-mark";
import { Navigate, useSearchParams } from "react-router";
import { AdminBackdrop } from "@/components/common/admin-backdrop";
import { meQuery, NOT_ADMIN_MESSAGE } from "../api/me.queries";
import { SignInForm } from "../components/sign-in-form";

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const me = useQuery(meQuery);

  // Đã đăng nhập bằng tài khoản trưởng xóm thì vào thẳng
  if (me.data?.role === ROLES.ADMIN) return <Navigate to={next} replace />;

  const initialError = searchParams.get("loi") === "khong-phai-admin" ? NOT_ADMIN_MESSAGE : null;

  return (
    <>
      <AdminBackdrop />
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
        {/* Form đăng nhập nằm thẳng trên ảnh nền: tấm `glass-bar` bo radius-2xl (MASTER 2.4) */}
        <div className="glass-bar flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-full border border-input/50 px-2.5 text-base font-bold tracking-tight">
              <LogoMark className="size-6" />
              Xóm Nhỏ
            </span>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              Quản trị
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Đăng nhập trang quản trị</h1>
            <p className="text-sm text-muted-foreground">Đăng nhập bằng tài khoản trưởng xóm.</p>
          </div>
          <SignInForm next={next} initialError={initialError} />
        </div>
      </main>
    </>
  );
}
