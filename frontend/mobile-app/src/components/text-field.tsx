import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { radius, space, text, weight } from "@/theme";
import { useTheme } from "@/theme/use-theme";

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  /** Ô mật khẩu: có nút hiện/ẩn, vẫn cho dán và cho trình quản lý mật khẩu điền */
  secure?: boolean;
};

/** Ô nhập có nhãn luôn hiện phía trên, lỗi ngay dưới ô (MASTER mục 7 "Form", pages/mobile.md). */
export function TextField({ label, error, hint, secure, style, ...props }: Props) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.destructive : focused ? colors.ring : colors.input;

  return (
    <View style={styles.block}>
      <Text style={[text.sm, { color: colors.foreground, fontWeight: weight.medium }]}>
        {label}
      </Text>
      <View
        style={[
          styles.box,
          { borderColor, borderWidth: focused ? 2 : 1, backgroundColor: colors.card },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={secure && !visible}
          autoCorrect={false}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[styles.input, text.base, { color: colors.foreground }, style]}
        />
        {secure ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            accessibilityState={{ selected: visible }}
            hitSlop={8}
            style={({ pressed }) => [styles.toggle, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[text.sm, { color: colors.primary, fontWeight: weight.semibold }]}>
              {visible ? "Ẩn" : "Hiện"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[text.sm, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[text.sm, { color: colors.mutedForeground }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: space[2] },
  box: { flexDirection: "row", alignItems: "center", borderRadius: radius.sm, minHeight: 48 },
  input: { flex: 1, paddingHorizontal: space[3], paddingVertical: space[2] },
  toggle: {
    minHeight: 44,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space[2],
  },
});
