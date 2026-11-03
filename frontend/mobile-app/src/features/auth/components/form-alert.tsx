import { StyleSheet, Text, View } from "react-native";
import { radius, space, text } from "@/theme";
import { useTheme } from "@/theme/use-theme";

/** Lỗi chung của form (sai mật khẩu, bị khóa...). Trình đọc màn hình đọc ngay khi lỗi xuất hiện. */
export function FormAlert({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.box, { borderColor: colors.destructive }]}
    >
      <Text style={[text.sm, { color: colors.destructive }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: radius.sm, padding: space[3] },
});
