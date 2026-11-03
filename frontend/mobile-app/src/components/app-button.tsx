import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { radius, space, text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
  disabled?: boolean;
};

/** Nút cao 48 (≥ 44pt), đang gửi thì khóa và hiện vòng quay nhưng giữ nguyên kích thước (MASTER mục 7 "Nút"). */
export function AppButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const primary = variant === "primary";
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      android_ripple={{ color: colors.muted }}
      style={({ pressed }) => [
        styles.button,
        primary
          ? { backgroundColor: colors.primary }
          : { borderWidth: 1, borderColor: colors.input, backgroundColor: "transparent" },
        { opacity: inactive ? 0.5 : pressed ? 0.7 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.primaryForeground : colors.foreground} />
      ) : (
        <Text
          style={[
            text.base,
            {
              fontWeight: weight.semibold,
              color: primary ? colors.primaryForeground : colors.foreground,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[4],
  },
});
