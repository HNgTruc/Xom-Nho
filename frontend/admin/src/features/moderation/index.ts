import type { RouteObject } from "react-router";

// Số bài chưa xem trên sidebar (app/layout)
export { UnseenCount } from "./components/unseen-count";

export const moderationRoutes: RouteObject[] = [
  {
    path: "bai-moi",
    lazy: async () => ({ Component: (await import("./pages/moderation-page")).ModerationPage }),
  },
];
