import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { backendUrlOrInvalid } from "./backend-url";

/**
 * Better Auth client của app: phiên lưu trong expo-secure-store (không dùng AsyncStorage), nên đóng mở
 * app vẫn còn đăng nhập. Scheme trùng "scheme" trong app.json và MOBILE_APP_SCHEME của backend.
 */
export const authClient = createAuthClient({
  baseURL: backendUrlOrInvalid,
  plugins: [expoClient({ scheme: "xomnho", storagePrefix: "xomnho", storage: SecureStore })],
});
