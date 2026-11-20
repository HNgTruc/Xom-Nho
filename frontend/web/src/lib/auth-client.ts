import { createAuthClient } from "better-auth/react";
import { PUBLIC_API_URL } from "./env";

/** Better Auth client trỏ về backend (/api/auth/*). Chỉ dùng trong Client Components. */
export const authClient = createAuthClient({
  baseURL: PUBLIC_API_URL,
  fetchOptions: { credentials: "include" },
});
