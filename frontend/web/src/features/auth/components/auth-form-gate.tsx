import { safeNext } from "@xom-nho/api";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import { getCurrentUser } from "../api/get-current-user";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Phần động của trang đăng nhập, đăng ký: đọc `?next=`, đã đăng nhập thì về `next`, lấy cách đăng nhập đang bật.
 * Đọc request nên trang bọc nó trong `<Suspense>`; tiêu đề trang nằm ngoài để chuyển trang hiện ngay
 * (Cache Components: đọc phiên ở cấp trang sẽ chặn cả trang khi chuyển tới).
 */
async function readAuthRequest(searchParams: SearchParams) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);
  const { data: providers } = await serverApi.auth.providers();
  return { params, next, providers };
}

export async function SignInGate({ searchParams }: { searchParams: SearchParams }) {
  const { params, next, providers } = await readAuthRequest(searchParams);
  const initialError =
    params.loi === "oauth"
      ? "Chưa đăng nhập được bằng tài khoản này. Bạn thử lại hoặc dùng email nhé."
      : null;
  return <SignInForm next={next} providers={providers} initialError={initialError} />;
}

export async function SignUpGate({ searchParams }: { searchParams: SearchParams }) {
  const { next, providers } = await readAuthRequest(searchParams);
  return <SignUpForm next={next} providers={providers} />;
}

/** Giữ đúng khung form để không xô bố cục khi phần động tải xong. */
export function AuthFormSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}
