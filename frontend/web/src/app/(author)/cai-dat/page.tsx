import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView, SettingsViewSkeleton } from "@/features/profile";

export const metadata: Metadata = {
  title: "Cài đặt",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-3 pt-4 pb-6 sm:px-4 md:px-6 md:pt-6 md:pb-8">
      <div className="flex flex-col gap-4">
        <header className="glass animate-rise-in rounded-xl p-5 sm:p-6">
          <h1 className="text-2xl font-bold md:text-3xl">Cài đặt</h1>
          <p className="mt-1 text-base text-muted-foreground">Sửa hồ sơ của bạn trong xóm.</p>
        </header>
        <div className="animate-rise-in [--stagger:1]">
          <Suspense fallback={<SettingsViewSkeleton />}>
            <SettingsView />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
