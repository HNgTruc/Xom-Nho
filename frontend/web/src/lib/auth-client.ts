import { createAuthClient } from "better-auth/react";

/** Better Auth client trỏ về backend (/api/auth/*). Chỉ dùng trong Client Components. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  fetchOptions: { credentials: "include" },
});
