import type * as React from "react";
import { cn } from "cn";

// Biểu trưng Xóm Nhỏ (MASTER mục 7 "Logo"): "xn" viết một mạch như chữ ký. Chữ x là hai nét cong quay lưng
// chạm nhau ở giữa, nét phải chạy tiếp thành chữ n. Chỉ có một bản, dùng ở mọi cỡ (favicon cũng vậy).
// Dựng trên lưới 32: x và n cao 16 (dòng 8 đến 24), vòm n bán kính 5, nét 3,75, đầu nét tròn.
// Tô bằng currentColor nên tự theo màu chữ của chế độ sáng/tối; không thêm màu hay bóng.
const logoPath =
  "M3.5 8C8 8 9.5 12 9.5 16C9.5 20 8 24 3.5 24M15.5 8C11 8 9.5 12 9.5 16C9.5 20 11 24 14.5 24C17 24 18.5 22.5 18.5 20V13A5 5 0 0 1 28.5 13V24";

type LogoMarkProps = Omit<React.ComponentProps<"svg">, "children"> & {
  /** Có `label` thì logo là ảnh có tên cho trình đọc màn hình; không có thì là hình trang trí (đặt cạnh chữ "Xóm Nhỏ"). */
  label?: string;
};

function LogoMark({ label, className, ...props }: LogoMarkProps) {
  return (
    <svg
      data-slot="logo-mark"
      viewBox="0 0 32 32"
      fill="none"
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cn("size-8 shrink-0", className)}
      {...props}
    >
      <path
        d={logoPath}
        stroke="currentColor"
        strokeWidth={3.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { LogoMark, logoPath };
export type { LogoMarkProps };
