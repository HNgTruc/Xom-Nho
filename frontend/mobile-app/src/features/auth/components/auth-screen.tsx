import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout, space, text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";

/** Khung chung của màn hình đăng nhập/đăng ký: tránh bàn phím, cuộn được khi chữ hệ thống to. */
export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + space[8] }]}
      >
        <Text
          accessibilityRole="header"
          style={[text["2xl"], { color: colors.foreground, fontWeight: weight.bold }]}
        >
          {title}
        </Text>
        <Text style={[text.base, { color: colors.mutedForeground }]}>{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: layout.gutter.phone, gap: space[4] },
});
