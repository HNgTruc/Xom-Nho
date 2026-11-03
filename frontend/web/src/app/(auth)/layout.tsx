import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-12">
      <Link href="/" className="self-center text-2xl font-bold text-primary">
        Xóm Nhỏ
      </Link>
      {children}
    </main>
  );
}
