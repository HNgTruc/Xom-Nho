import { ScrollView, StyleSheet, Text } from "react-native";
import { BackendStatus } from "@/components/backend-status";
import { layout, space, text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";

// Màn hình tạm của giai đoạn 0: kiểm tra theme và kết nối backend. Bốn tab chính làm ở giai đoạn 6.
export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[text["2xl"], { color: colors.foreground, fontWeight: weight.bold }]}>
        Xóm Nhỏ
      </Text>
      <Text style={[text.base, { color: colors.mutedForeground }]}>
        Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.
      </Text>
      <BackendStatus />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: layout.gutter.phone, gap: space[4] },
});
