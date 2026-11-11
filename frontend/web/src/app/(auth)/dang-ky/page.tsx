import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormSkeleton, SignUpGate } from "@/features/auth";

export const metadata: Metadata = { title: "Đăng ký" };

// Tiêu đề tĩnh hiện ngay; phần đọc phiên và `?next=` nằm trong Suspense
export default function SignUpPage({ searchParams }: PageProps<"/dang-ky">) {
  return (
    <section className="flex flex-col gap-6" aria-labelledby="sign-up-title">
      <div className="flex flex-col gap-1">
        <h1 id="sign-up-title" className="text-2xl font-semibold">
          Làm hàng xóm
        </h1>
        <p className="text-muted-foreground">Tạo tài khoản để viết bài và trò chuyện cùng xóm.</p>
      </div>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignUpGate searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
