// MASTER mục 5. Motion 5/10: phản hồi tương tác, và mỗi khối hiện ra lần lượt khi trang tải.
// Chỉ animate opacity và transform.

export const duration = {
  /** Đổi màu hover, nhấn nút */
  fast: 120,
  /** Mở dropdown, tooltip, đổi tab, thẻ nổi lên khi hover */
  base: 200,
  /** Hộp thoại, bottom sheet */
  slow: 280,
  /** Khối nội dung hiện ra khi trang tải (rise-in) */
  enter: 520,
} as const;

/** Khoảng trễ giữa hai khối liên tiếp khi hiện ra lần lượt (ms). Tối đa 8 bậc để trang không chờ lâu. */
export const stagger = { step: 60, maxSteps: 8 } as const;

/** cubic-bezier(0.2, 0, 0, 1); mobile dùng mảng điểm điều khiển cho Easing.bezier */
export const easing = {
  css: "cubic-bezier(0.2, 0, 0, 1)",
  bezier: [0.2, 0, 0, 1],
  /** Khối hiện ra: nhanh lúc đầu, chậm dần, không nảy */
  enterCss: "cubic-bezier(0.16, 1, 0.3, 1)",
  enterBezier: [0.16, 1, 0.3, 1],
} as const;
