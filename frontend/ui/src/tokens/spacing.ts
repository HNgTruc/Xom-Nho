// MASTER mục 4. Nhịp 4/8, đơn vị px (web) / dp (mobile). Trùng thang mặc định của Tailwind (`p-4` = 16px).

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

export const layout = {
  gutter: { phone: 16, tablet: 24, desktop: 32 },
  contentMaxWidth: 1120,
  readingWidth: 720,
  /** Cột chữ bài viết trên tablet (pages/mobile.md) */
  readingWidthTablet: 640,
  headerHeight: 56,
} as const;

/** Điểm ngắt cần kiểm tra giao diện */
export const breakpoints = [375, 768, 1024, 1440] as const;
