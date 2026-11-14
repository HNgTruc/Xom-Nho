import backdrop from "@xom-nho/ui/assets/backdrop/bien-may.jpg";

/**
 * Ảnh nền biển và mây sau mọi trang quản trị, như web (MASTER 2.4, pages/admin.md "Kính mờ"). Ảnh làm mờ sẵn một
 * lần (`blur-glass-shell`), phóng to 4% để mép mờ nằm ngoài màn hình; chế độ tối giảm sáng 25%. Chỉ trang trí nên
 * `alt=""`. `right-scroll-bar-position`: hộp thoại khóa cuộn thì ảnh không giãn ra (xem SiteBackdrop của web).
 */
export function AdminBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="right-scroll-bar-position fixed inset-0 -z-10 overflow-hidden"
    >
      <img
        src={backdrop}
        alt=""
        decoding="async"
        className="size-full scale-[1.04] object-cover blur-glass-shell dark:brightness-75"
      />
    </div>
  );
}
