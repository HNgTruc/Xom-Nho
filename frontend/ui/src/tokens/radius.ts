// MASTER mục 4. Chỉ ba mức bo góc, cộng `full` cho avatar.

export const radius = {
  /** Badge, ô nhập */
  sm: 6,
  /** Nút, thẻ */
  md: 10,
  /** Hộp thoại, bottom sheet */
  lg: 14,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
