import { colors, fontSize, fontWeight, layout, radius, space } from "@xom-nho/ui/tokens";

/**
 * Theme của app, đọc từ `@xom-nho/ui/tokens` để app và web luôn cùng một bộ màu.
 * Màn hình lấy màu qua `useTheme()` (theo chế độ sáng/tối của hệ thống), không viết mã màu cứng.
 */
export type ColorScheme = keyof typeof colors;
export type ThemeColors = (typeof colors)[ColorScheme];

export function getColors(scheme: ColorScheme | null | undefined): ThemeColors {
  return scheme === "dark" ? colors.dark : colors.light;
}

/** Cỡ chữ cho React Native: `fontSize` + `lineHeight` tính bằng dp. */
export const text = Object.fromEntries(
  Object.entries(fontSize).map(([name, value]) => [
    name,
    { fontSize: value.size, lineHeight: value.lineHeight },
  ]),
) as { [K in keyof typeof fontSize]: { fontSize: number; lineHeight: number } };

/** React Native nhận `fontWeight` dạng chuỗi. */
export const weight = Object.fromEntries(
  Object.entries(fontWeight).map(([name, value]) => [name, String(value)]),
) as { [K in keyof typeof fontWeight]: `${(typeof fontWeight)[K]}` };

export { layout, radius, space };
