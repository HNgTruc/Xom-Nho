import type { RouteObject } from "react-router";

export const commentsRoutes: RouteObject[] = [
  {
    path: "binh-luan",
    lazy: async () => ({ Component: (await import("./pages/comments-page")).CommentsPage }),
  },
];
