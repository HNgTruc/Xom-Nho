import Image from "next/image";
import backdrop from "@/assets/backdrop/bien-may.jpg";

/**
 * Ảnh nền cố định sau mọi trang (MASTER 2.4): biển và mây, ảnh của Tuấn Vũ trên Pexels.
 * `next/image` tự chọn cỡ và định dạng (WebP/AVIF) theo màn hình; `placeholder="blur"` hiện bản mờ khi đang tải.
 * Ảnh chỉ để trang trí nên `alt=""`. Chế độ tối giảm sáng ảnh để khung kính tối không bị loang.
 */
export function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="object-cover dark:brightness-75"
      />
    </div>
  );
}
