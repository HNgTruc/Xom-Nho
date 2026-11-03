import { useQuery } from "@tanstack/react-query";
import { ROLES, safeNext } from "@xom-nho/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@xom-nho/ui/components/card";
import { Navigate, useSearchParams } from "react-router";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quản trị Xóm Nhỏ</CardTitle>
          <CardDescription>Đăng nhập bằng tài khoản trưởng xóm.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm next={next} initialError={initialError} />
        </CardContent>
      </Card>
    </main>
  );
}
