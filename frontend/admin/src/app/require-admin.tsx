import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ROLES } from "@xom-nho/shared";
import { Button } from "@xom-nho/ui/components/button";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { meQuery } from "@/features/auth/api/me.queries";
import { authClient } from "@/lib/auth-client";

/**
 * Bọc mọi trang quản trị: chưa đăng nhập thì về /dang-nhap, đăng nhập mà không phải trưởng xóm thì
 * đăng xuất và báo lỗi. Chỉ để trải nghiệm tốt hơn; chặn thật là RolesGuard ở backend.
 */
export function RequireAdmin() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const me = useQuery(meQuery);
  const notAdmin = me.data != null && me.data.role !== ROLES.ADMIN;

  useEffect(() => {
    if (!notAdmin) return;
    void authClient.signOut().then(() => queryClient.setQueryData(meQuery.queryKey, null));
  }, [notAdmin, queryClient]);

  if (me.isPending) {
    return (
      <div
        className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-16"
        aria-busy="true"
        aria-label="Đang tải"
      >
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (me.isError) {
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-start gap-3 px-4 py-16">
        <p>Có trục trặc khi kiểm tra đăng nhập. Bạn thử lại sau ít phút nhé.</p>
        <Button variant="outline" onClick={() => me.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const next = encodeURIComponent(location.pathname + location.search);
  if (!me.data) return <Navigate to={`/dang-nhap?next=${next}`} replace />;
  if (notAdmin) return <Navigate to="/dang-nhap?loi=khong-phai-admin" replace />;

  return <Outlet />;
}
