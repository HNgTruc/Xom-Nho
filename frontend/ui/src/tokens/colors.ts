// Bản code của docs/design-system/xom-nho/MASTER.md mục 2. Đổi giá trị thì sửa cả MASTER và styles/theme.css
// (test styles/theme.test.ts báo lỗi nếu lệch). Tương phản đã tính trên kính đặt trên ảnh nền (MASTER 2.4).

export const colors = {
  light: {
    background: "#E6EEF0",
    foreground: "#18181B",
    card: "#FFFFFF",
    cardForeground: "#18181B",
    muted: "#F1F4F5",
    mutedForeground: "#52525B",
    primary: "#18181B",
    primaryForeground: "#FFFFFF",
    secondary: "#15803D",
    secondaryForeground: "#FFFFFF",
    accent: "#BAE6FD",
    accentForeground: "#18181B",
    link: "#075985",
    border: "#E4E4E7",
    input: "#71717A",
    ring: "#0369A1",
    destructive: "#B91C1C",
    destructiveForeground: "#FFFFFF",
  },
  dark: {
    background: "#0B1214",
    foreground: "#FAFAFA",
    card: "#18181B",
    cardForeground: "#FAFAFA",
    muted: "#27272A",
    mutedForeground: "#A1A1AA",
    primary: "#FAFAFA",
    primaryForeground: "#18181B",
    secondary: "#4ADE80",
    secondaryForeground: "#18181B",
    accent: "#7DD3FC",
    accentForeground: "#09090B",
    link: "#7DD3FC",
    border: "#3F3F46",
    input: "#8B8B94",
    ring: "#38BDF8",
    destructive: "#F87171",
    destructiveForeground: "#18181B",
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof (typeof colors)["light"];

/**
 * Màu danh mục (MASTER 2.2). Đặt theo sắc độ: danh mục lưu khóa (`amber`, `blue`...), không lưu mã màu.
 * Chế độ tối: nền đặc, là màu chữ trộn 14% trên `#18181B`. Không dùng nền trong suốt: kính trên ảnh nền
 * đổi độ sáng theo chỗ, nền badge trong suốt sẽ tụt dưới 4.5:1 ở chỗ ảnh sáng.
 */
export const categoryColors = {
  amber: {
    light: { fg: "#B45309", bg: "#FEF3C7" },
    dark: { fg: "#FBBF24", bg: "#382F1C" },
  },
  blue: {
    light: { fg: "#1D4ED8", bg: "#DBEAFE" },
    dark: { fg: "#60A5FA", bg: "#222C3A" },
  },
  green: {
    light: { fg: "#047857", bg: "#D1FAE5" },
    dark: { fg: "#34D399", bg: "#1C322D" },
  },
  purple: {
    light: { fg: "#7E22CE", bg: "#F3E8FF" },
    dark: { fg: "#C084FC", bg: "#30273B" },
  },
  rose: {
    light: { fg: "#BE123C", bg: "#FFE4E6" },
    dark: { fg: "#FB7185", bg: "#38242A" },
  },
} as const;

export type CategoryColor = keyof typeof categoryColors;

/** Màu badge trạng thái bài (MASTER 2.3). Luôn đi kèm chữ và biểu tượng, không dùng màu đơn thuần. */
export const statusColors = {
  draft: {
    light: { fg: "#52525B", bg: "#E4E4E7" },
    dark: { fg: "#D4D4D8", bg: "#323235" },
  },
  pending: {
    light: { fg: "#92400E", bg: "#FEF3C7" },
    dark: { fg: "#FCD34D", bg: "#383222" },
  },
  published: {
    light: { fg: "#166534", bg: "#DCFCE7" },
    dark: { fg: "#86EFAC", bg: "#27362F" },
  },
  rejected: {
    light: { fg: "#991B1B", bg: "#FEE2E2" },
    dark: { fg: "#FCA5A5", bg: "#382C2E" },
  },
  hidden: {
    light: { fg: "#52525B", bg: "#F4F4F5" },
    dark: { fg: "#A1A1AA", bg: "#2B2B2F" },
  },
} as const;

export type StatusColor = keyof typeof statusColors;
