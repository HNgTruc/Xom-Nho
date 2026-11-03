import { createClient } from "@xom-nho/shared/api-client";
import Constants from "expo-constants";
import { resolveApiUrl } from "./api-url";

export const apiUrl = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, Constants.expoConfig?.hostUri);

/** api-client của app. TODO(giai đoạn 2): gửi cookie phiên do plugin Expo của Better Auth lưu. */
export const api = createClient({
  // Thiếu địa chỉ thì mọi request lỗi ngay, màn hình hiện hướng dẫn đặt EXPO_PUBLIC_API_URL
  baseUrl: apiUrl ?? "http://khong-biet-dia-chi-backend.invalid",
});
