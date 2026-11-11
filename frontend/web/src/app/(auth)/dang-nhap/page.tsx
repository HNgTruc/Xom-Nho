import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton, SignInGate } from "@/features/auth";

export const metadata: Metadata = { title: "Đăng nhập" };

// Tiêu đề tĩnh hiện ngay; phần đọc phiên và `?next=` nằm trong Suspense
export default function SignInPage({ searchParams }: PageProps<"/dang-nhap">) {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="sign-in-title">
      <div className="flex flex-col gap-1">
        <h1 id="sign-in-title" className="text-2xl font-semibold">
          Đăng nhập
        </h1>
        <p className="text-muted-foreground">Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.</p>
      </div>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignInGate searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
