// Bản code của docs/design-system/xom-nho/MASTER.md mục 2.4 (kính mờ). Đổi giá trị thì sửa cả MASTER và
// styles/theme.css (test styles/theme.test.ts báo lỗi nếu lệch). Tương phản đã tính ở năm mức sáng của ảnh nền
// sau khi làm mờ 6px, từ chỗ tối nhất (mặt biển, bụi cây) tới chỗ sáng nhất (mây).

/**
 * Các lớp kính:
 * - `shell`: khung lớn bao cả trang, làm mờ ảnh nền phía sau. Không đặt chữ thẳng lên nên rất trong.
 * - `surface`: tấm nội dung trong khung (thẻ bài, đầu trang), không làm mờ thêm.
 * - `strong`: tấm gần đặc cho chỗ đọc lâu (bài viết, form), thanh header, menu thả xuống.
 * - `button`: nút phụ, tab, chip: kính mỏng tự làm mờ. `primary`: nút chính, kính màu `primary`.
 */
export const glass = {
  light: {
    shell: "rgb(255 255 255 / 0.3)",
    surface: "rgb(255 255 255 / 0.75)",
    strong: "rgb(255 255 255 / 0.85)",
    button: "rgb(255 255 255 / 0.45)",
    buttonHover: "rgb(255 255 255 / 0.7)",
    primary: "rgb(24 24 27 / 0.82)",
    primaryHover: "rgb(63 63 70 / 0.9)",
    border: "rgb(255 255 255 / 0.55)",
    borderHover: "rgb(113 113 122 / 0.45)",
    shadow: "0 1px 2px rgb(9 9 11 / 0.04), 0 8px 24px rgb(9 9 11 / 0.06)",
    shadowHover: "0 2px 4px rgb(9 9 11 / 0.05), 0 16px 40px rgb(9 9 11 / 0.12)",
    shellShadow: "0 24px 80px rgb(9 9 11 / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.7)",
  },
  dark: {
    shell: "rgb(9 9 11 / 0.45)",
    surface: "rgb(9 9 11 / 0.68)",
    strong: "rgb(9 9 11 / 0.85)",
    button: "rgb(24 24 27 / 0.45)",
    buttonHover: "rgb(39 39 42 / 0.7)",
    primary: "rgb(250 250 250 / 0.88)",
    primaryHover: "rgb(212 212 216 / 0.92)",
    border: "rgb(255 255 255 / 0.1)",
    borderHover: "rgb(255 255 255 / 0.24)",
    shadow: "0 1px 2px rgb(0 0 0 / 0.2), 0 8px 24px rgb(0 0 0 / 0.25)",
    shadowHover: "0 2px 4px rgb(0 0 0 / 0.25), 0 16px 40px rgb(0 0 0 / 0.4)",
    shellShadow: "0 24px 80px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.08)",
  },
} as const;

/** Độ làm mờ (px): khung làm mờ ảnh nền, thanh header và nút kính trôi trên nội dung. Mobile: pages/mobile.md. */
export const glassBlur = { shell: 6, bar: 10, button: 6 } as const;
