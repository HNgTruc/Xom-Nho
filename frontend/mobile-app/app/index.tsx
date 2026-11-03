import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/app-button";
import { BackendStatus } from "@/components/backend-status";
import { useMe } from "@/features/auth";
import { authClient } from "@/lib/auth-client";
import { layout, space, text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";

// Màn hình tạm: lời chào theo người đăng nhập, đăng nhập/đăng xuất, kết nối backend. Bốn tab chính ở giai đoạn 6.
export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { me, isPending } = useMe();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: ["me"] });
    setSigningOut(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text
        accessibilityRole="header"
        style={[text["2xl"], { color: colors.foreground, fontWeight: weight.bold }]}
      >
        Xóm Nhỏ
      </Text>

      {isPending ? (
        <ActivityIndicator color={colors.primary} accessibilityLabel="Đang kiểm tra đăng nhập" />
      ) : me ? (
        <View style={styles.block}>
          <Text style={[text.base, { color: colors.foreground }]}>
            Chào {me.name}, hôm nay xóm có gì mới nè.
          </Text>
          <AppButton label="Đăng xuất" variant="outline" onPress={signOut} loading={signingOut} />
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={[text.base, { color: colors.mutedForeground }]}>
            Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.
          </Text>
          <AppButton label="Đăng nhập" onPress={() => router.push("/dang-nhap")} />
          <AppButton label="Đăng ký" variant="outline" onPress={() => router.push("/dang-ky")} />
        </View>
      )}

      <BackendStatus />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: layout.gutter.phone, gap: space[6] },
  block: { gap: space[3] },
});
