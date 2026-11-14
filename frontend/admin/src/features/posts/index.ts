import type { RouteObject } from "react-router";

export const postsRoutes: RouteObject[] = [
  {
    path: "bai-viet",
    lazy: async () => ({ Component: (await import("./pages/posts-page")).PostsPage }),
  },
];
