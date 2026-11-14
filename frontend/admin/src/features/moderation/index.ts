import type { RouteObject } from "react-router";

// Số bài chưa xem trên sidebar (app/layout)
export { UnseenCount } from "./components/unseen-count";
// Mốc lần xem trước: Tổng quan (features/dashboard) hiện bài chưa xem theo cùng mốc với sidebar
export { useLastSeen } from "./lib/last-seen";

export const moderationRoutes: RouteObject[] = [
  {
    path: "bai-moi",
    lazy: async () => ({ Component: (await import("./pages/moderation-page")).ModerationPage }),
  },
];
