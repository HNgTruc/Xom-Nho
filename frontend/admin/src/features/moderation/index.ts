import type { RouteObject } from "react-router";

export const moderationRoutes: RouteObject[] = [
  {
    path: "bai-moi",
    lazy: async () => ({ Component: (await import("./pages/moderation-page")).ModerationPage }),
  },
];
