import Link from "next/link";
import type { ReactNode } from "react";

// Form nằm thẳng trên ảnh nền (không có khung lớn), nên dùng `glass-bar`: tấm gần đặc tự làm mờ (MASTER 2.4)

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="glass-bar flex animate-rise-in flex-col gap-6 rounded-2xl p-6 sm:p-8">
        <Link
          href="/"
          className="inline-flex h-10 items-center self-start rounded-full border border-input/50 px-4 text-base font-bold tracking-tight text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Xóm Nhỏ
        </Link>
        {children}
      </div>
    </main>
  );
}
