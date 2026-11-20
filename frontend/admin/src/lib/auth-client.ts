import { createAuthClient } from "better-auth/react";
import { API_URL } from "./env";

/** Better Auth client trỏ về backend (/api/auth/*), gửi kèm cookie phiên. */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: "include" },
});
