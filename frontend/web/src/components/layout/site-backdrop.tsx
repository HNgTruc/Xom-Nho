import Image from "next/image";
import backdrop from "@/assets/backdrop/bien-may.jpg";

/**
 * Ảnh nền cố định sau mọi trang (MASTER 2.4): biển và mây, ảnh của Tuấn Vũ trên Pexels.
 * `next/image` tự chọn cỡ và định dạng (WebP/AVIF) theo màn hình; `placeholder="blur"` hiện bản mờ khi đang tải.
 * Ảnh chỉ để trang trí nên `alt=""`. Chế độ tối giảm sáng ảnh để khung kính tối không bị loang.
 * Ảnh được làm mờ sẵn một lần (`blur-glass-shell`, MASTER 2.4) thay cho làm mờ phía sau khung kính: lớp cố định
 * không đổi nên trình duyệt chỉ tính phép làm mờ một lần, cuộn trang không phải tính lại. Phóng to 4% để mép ảnh
 * bị làm mờ (mép mờ dần ra trong suốt) nằm ngoài màn hình.
 * `right-scroll-bar-position`: khi hộp thoại khóa cuộn (thanh cuộn biến mất), thư viện khóa cuộn của Radix đặt
 * `right` bằng bề rộng thanh cuộn cho lớp này, nên ảnh không giãn ra và nhảy (Windows, thanh cuộn 15px).
 */
export function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="right-scroll-bar-position fixed inset-0 -z-10 overflow-hidden">
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        className="scale-[1.04] object-cover blur-glass-shell dark:brightness-75"
      />
    </div>
  );
}
