import { createAuthClient } from "better-auth/react";

/** Better Auth client trỏ về backend (/api/auth/*), gửi kèm cookie phiên. */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  fetchOptions: { credentials: "include" },
});
