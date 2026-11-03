import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { apiUrl, api } from "@/lib/api";
import { radius, space, text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";

/** Cho biết app có gọi được `GET /api/v1/health` không; lỗi thì có nút thử lại và gợi ý cách sửa. */
export function BackendStatus() {
  const { colors } = useTheme();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => api.health.check(signal),
    retry: false,
  });

  if (health.isPending) {
    return (
      <ActivityIndicator
        color={colors.primary}
        accessibilityLabel="Đang kiểm tra kết nối backend"
      />
    );
  }

  if (health.isError) {
    return (
      <View style={styles.block}>
        <Text style={[text.base, { color: colors.destructive, fontWeight: weight.semibold }]}>
          Chưa kết nối được backend
        </Text>
        <Text style={[text.sm, { color: colors.mutedForeground }]}>
          {apiUrl
            ? `Đang gọi ${apiUrl}. Kiểm tra backend đã chạy, điện thoại cùng Wi-Fi với máy tính và tường lửa không chặn cổng 4000.`
            : "Chưa biết địa chỉ backend. Đặt EXPO_PUBLIC_API_URL trong frontend/mobile-app/.env."}
        </Text>
        <Pressable
          onPress={() => health.refetch()}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text
            style={[text.base, { color: colors.primaryForeground, fontWeight: weight.semibold }]}
          >
            Thử lại
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Text style={[text.base, { color: colors.secondary, fontWeight: weight.semibold }]}>
      Đã kết nối backend
    </Text>
  );
}

const styles = StyleSheet.create({
  block: { gap: space[2] },
  button: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    marginTop: space[2],
  },
});
