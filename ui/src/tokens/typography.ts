// MASTER mục 3. Cỡ chữ tính bằng px (web) / dp (mobile).

export const fontFamily = {
  /** Giao diện: nút, menu, tiêu đề, thẻ bài */
  ui: "Be Vietnam Pro",
  /** Thân bài viết */
  reading: "Lora",
  mono: 'ui-monospace, "Cascadia Code", Consolas, monospace',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSize = {
  xs: { size: 12, lineHeight: 16 },
  sm: { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg: { size: 18, lineHeight: 28 },
  xl: { size: 20, lineHeight: 28 },
  "2xl": { size: 24, lineHeight: 32 },
  "3xl": { size: 30, lineHeight: 38 },
  "4xl": { size: 36, lineHeight: 44 },
} as const;

export type FontSizeToken = keyof typeof fontSize;

/** Thân bài viết (font Lora). Web dùng hệ số dòng, mobile dùng dp (override pages/mobile.md). */
export const prose = {
  web: { size: 18, lineHeight: 1.7, maxWidth: "68ch" },
  mobile: { size: 17, lineHeight: 28 },
} as const;
