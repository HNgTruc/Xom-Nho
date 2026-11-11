import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNext } from "@xom-nho/api";
import { getCurrentUser, SignInForm } from "@/features/auth";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function SignInPage({ searchParams }: PageProps<"/dang-nhap">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);

  const { data: providers } = await serverApi.auth.providers();
  const initialError =
    params.loi === "oauth"
      ? "Chưa đăng nhập được bằng tài khoản này. Bạn thử lại hoặc dùng email nhé."
      : null;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="sign-in-title">
      <div className="flex flex-col gap-1">
        <h1 id="sign-in-title" className="text-2xl font-semibold">
          Đăng nhập
        </h1>
        <p className="text-muted-foreground">Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.</p>
      </div>
      <SignInForm next={next} providers={providers} initialError={initialError} />
    </section>
  );
}
