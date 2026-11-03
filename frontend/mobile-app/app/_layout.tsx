import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@/lib/query-client";
import { useTheme } from "@/theme/use-theme";

export default function RootLayout() {
  const { scheme, colors } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Xóm Nhỏ" }} />
        <Stack.Screen name="(auth)/dang-nhap" options={{ title: "Đăng nhập" }} />
        <Stack.Screen name="(auth)/dang-ky" options={{ title: "Đăng ký" }} />
      </Stack>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </QueryClientProvider>
  );
}
