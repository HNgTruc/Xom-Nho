import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

/**
 * Khung kính lớn bao cả trang (MASTER 2.4, mục 8): rộng gần hết màn hình, rất trong (trắng 30%), làm mờ
 * ảnh nền phía sau, chừa một viền ảnh mỏng quanh khung.
 * Header dính nằm trong khung (`guest`: header của khách, xem SiteHeader); nội dung từng trang là các tấm `glass` bên trong, không làm mờ thêm.
 */
export function SiteShell({ children, guest }: { children: ReactNode; guest?: boolean }) {
  return (
    <div className="w-full p-2 sm:p-3 lg:p-4">
      <div className="glass-shell flex min-h-[calc(100dvh-1rem)] flex-col rounded-2xl sm:min-h-[calc(100dvh-1.5rem)] lg:min-h-[calc(100dvh-2rem)]">
        <SiteHeader guest={guest} />
        {children}
      </div>
    </div>
  );
}
