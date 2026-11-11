// Bản code của docs/design-system/xom-nho/MASTER.md mục 2. Đổi giá trị thì sửa cả MASTER và styles/theme.css
// (test styles/theme.test.ts báo lỗi nếu lệch).

export const colors = {
  light: {
    background: "#FBF8F3",
    foreground: "#292524",
    card: "#FFFFFF",
    cardForeground: "#292524",
    muted: "#F3EFE8",
    mutedForeground: "#6B635E",
    primary: "#C2410C",
    primaryForeground: "#FFFFFF",
    secondary: "#15803D",
    secondaryForeground: "#FFFFFF",
    border: "#E7E5E4",
    input: "#8F8883",
    ring: "#C2410C",
    destructive: "#B91C1C",
    destructiveForeground: "#FFFFFF",
  },
  dark: {
    background: "#1C1917",
    foreground: "#F5F5F4",
    card: "#292524",
    cardForeground: "#F5F5F4",
    muted: "#292524",
    mutedForeground: "#A8A29E",
    primary: "#FB923C",
    primaryForeground: "#1C1917",
    secondary: "#4ADE80",
    secondaryForeground: "#1C1917",
    border: "#44403C",
    input: "#78716C",
    ring: "#FB923C",
    destructive: "#F87171",
    destructiveForeground: "#1C1917",
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof (typeof colors)["light"];

/**
 * Màu danh mục (MASTER 2.2). Đặt theo sắc độ: danh mục lưu khóa (`amber`, `blue`...), không lưu mã màu.
 * Chế độ tối: nền là màu chữ với độ mờ 12% (`1F`), không tăng thêm vì purple/rose sẽ dưới 4.5:1.
 */
export const categoryColors = {
  amber: {
    light: { fg: "#B45309", bg: "#FEF3C7" },
    dark: { fg: "#FBBF24", bg: "#FBBF241F" },
  },
  blue: {
    light: { fg: "#1D4ED8", bg: "#DBEAFE" },
    dark: { fg: "#60A5FA", bg: "#60A5FA1F" },
  },
  green: {
    light: { fg: "#047857", bg: "#D1FAE5" },
    dark: { fg: "#34D399", bg: "#34D3991F" },
  },
  purple: {
    light: { fg: "#7E22CE", bg: "#F3E8FF" },
    dark: { fg: "#C084FC", bg: "#C084FC1F" },
  },
  rose: {
    light: { fg: "#BE123C", bg: "#FFE4E6" },
    dark: { fg: "#FB7185", bg: "#FB71851F" },
  },
} as const;

export type CategoryColor = keyof typeof categoryColors;

/** Màu badge trạng thái bài (MASTER 2.3). Luôn đi kèm chữ và biểu tượng, không dùng màu đơn thuần. */
export const statusColors = {
  draft: {
    light: { fg: "#57534E", bg: "#E7E5E4" },
    dark: { fg: "#D6D3D1", bg: "#D6D3D11F" },
  },
  pending: {
    light: { fg: "#92400E", bg: "#FEF3C7" },
    dark: { fg: "#FCD34D", bg: "#FCD34D1F" },
  },
  published: {
    light: { fg: "#166534", bg: "#DCFCE7" },
    dark: { fg: "#86EFAC", bg: "#86EFAC1F" },
  },
  rejected: {
    light: { fg: "#991B1B", bg: "#FEE2E2" },
    dark: { fg: "#FCA5A5", bg: "#FCA5A51F" },
  },
  hidden: {
    light: { fg: "#57534E", bg: "#F5F5F4" },
    dark: { fg: "#A8A29E", bg: "#A8A29E1F" },
  },
} as const;

export type StatusColor = keyof typeof statusColors;
