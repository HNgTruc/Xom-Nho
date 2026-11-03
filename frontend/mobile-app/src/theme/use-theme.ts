import { useColorScheme } from "react-native";
import { getColors } from "./index";

/** Màu theo chế độ sáng/tối hiện tại của hệ thống (override pages/mobile.md). */
export function useTheme() {
  const scheme = useColorScheme();
  return { scheme: scheme === "dark" ? "dark" : "light", colors: getColors(scheme) } as const;
}
