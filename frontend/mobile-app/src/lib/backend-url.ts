import Constants from "expo-constants";
import { resolveApiUrl } from "./api-url";

/** Gốc của backend cho app (biến môi trường, hoặc IP của máy chạy Metro). null khi không biết. */
export const backendUrl = resolveApiUrl(
  process.env.EXPO_PUBLIC_API_URL,
  Constants.expoConfig?.hostUri,
);

/** Thiếu địa chỉ thì mọi request lỗi ngay, màn hình hiện hướng dẫn đặt EXPO_PUBLIC_API_URL. */
export const backendUrlOrInvalid = backendUrl ?? "http://khong-biet-dia-chi-backend.invalid";
