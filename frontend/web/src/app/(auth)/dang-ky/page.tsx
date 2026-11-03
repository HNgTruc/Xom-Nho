import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNext } from "@xom-nho/shared";
import { getCurrentUser, SignUpForm } from "@/features/auth";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function SignUpPage({ searchParams }: PageProps<"/dang-ky">) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  const { data: providers } = await serverApi.auth.providers();

  return (
    <section className="flex flex-col gap-6" aria-labelledby="sign-up-title">
      <div className="flex flex-col gap-1">
        <h1 id="sign-up-title" className="text-2xl font-semibold">
          Làm hàng xóm
        </h1>
        <p className="text-muted-foreground">Tạo tài khoản để viết bài và trò chuyện cùng xóm.</p>
      </div>
      <SignUpForm next={next} providers={providers} />
    </section>
  );
}
