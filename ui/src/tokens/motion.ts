// MASTER mục 5. Motion 2/10: chỉ phản hồi tương tác, chỉ animate opacity và transform.

export const duration = {
  /** Đổi màu hover, nhấn nút */
  fast: 120,
  /** Mở dropdown, tooltip, đổi tab */
  base: 200,
  /** Hộp thoại, bottom sheet */
  slow: 280,
} as const;

/** cubic-bezier(0.2, 0, 0, 1); mobile dùng mảng điểm điều khiển cho Easing.bezier */
export const easing = {
  css: "cubic-bezier(0.2, 0, 0, 1)",
  bezier: [0.2, 0, 0, 1],
} as const;
